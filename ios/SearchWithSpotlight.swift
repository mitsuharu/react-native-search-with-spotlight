import Foundation
import CoreSpotlight
import Alamofire
import AlamofireImage

// React Native に送信される Listener name
fileprivate enum SearchWithSpotlightListener: String, CaseIterable {
  case onSearchWithSpotlightRequest
}

// constants
fileprivate class SearchItemKey {
    static let title = "title"
    static let description = "description"
    static let keywords = "keywords"
    static let imageUrl = "imageUrl"
    static let domain = "domain"
    static let id = "id"
}

@objc(SearchWithSpotlight)
class SearchWithSpotlight: RCTEventEmitter {

    @objc public static let shared = SearchWithSpotlight()

    var hasListeners:Bool = false
    let sharedJsModule = RCTCallableJSModules()

    override init() {
      super.init()
      for listener in SearchWithSpotlightListener.allCases {
        self.addListener(listener.rawValue)
      }
    }
    
    deinit {
      self.removeListeners(Double(SearchWithSpotlightListener.allCases.count))
    }
    
    private func getKeyWindow() -> UIWindow? {
        if #available(iOS 13.0, *) {
            return UIApplication.shared.windows.first { $0.isKeyWindow }
        } else {
            return UIApplication.shared.keyWindow
        }
    }

    private func bridgeFromWindow() -> RCTBridge? {
        guard
            let window: UIWindow = getKeyWindow(),
            let vc: UIViewController = window.rootViewController,
            let rootView: RCTRootView = vc.view as? RCTRootView else{
            return nil
        }
        return rootView.bridge
    }
}

// for iOS Native
extension SearchWithSpotlight{
    
    @objc(setup:)
    static public func setup(bridge: RCTBridge? = nil) {
        guard let bridge = bridge else{
            return
        }
        let obj = SearchWithSpotlight.shared
        obj.bridge = bridge
    }
    
    @objc(handle:)
    static public func handle(_ userActivity: NSUserActivity) -> Bool {
        var identifier: String? = nil
        if userActivity.activityType == CSSearchableItemActionType{
            identifier = userActivity.userInfo?[CSSearchableItemActivityIdentifier] as? String
        }
        var query: String? = nil
        if userActivity.activityType == CSQueryContinuationActionType {
            query = userActivity.userInfo?[CSSearchQueryString] as? String
        }
        let obj = SearchWithSpotlight.shared
        return obj.sendIdentifierToReactNative(identifier: identifier, query: query)
    }
}

// for React Native
extension SearchWithSpotlight {
    
    @objc
    override func supportedEvents() -> [String]! {
      return SearchWithSpotlightListener.allCases.map {
        $0.rawValue
      }
    }
    
    func sendIdentifierToReactNative(identifier: String? = nil,
                                     query: String? = nil) -> Bool {
        if self.bridge == nil {
            self.bridge = self.bridgeFromWindow()
        }
        
        self.callableJSModules = sharedJsModule
        self.callableJSModules.setBridge(self.bridge)
        
        assert(self.bridge != nil, """
Error when sending event: onSearchWithSpotlightRequest with body: (identifier: \(identifier ?? ""), query: \(query ?? "")).
Bridge in SearchWithSpotlight is nil. When use `sendEvent(withName:body:)`, bridge must be set.
You shuold verify bridge value or use `+ (void)setup:(RCTBridge*)bridge;` at `application:didFinishLaunchingWithOptions:`.
""")
        
        if self.bridge != nil && (identifier != nil || query != nil) {
            self.sendEvent(withName: SearchWithSpotlightListener.onSearchWithSpotlightRequest.rawValue,
                           body: ["id": identifier, "query": query])
            return true
        }
        return false
    }
    
    @objc
    func isSupported(_ resolve: @escaping RCTPromiseResolveBlock,
                     rejecter reject: @escaping RCTPromiseRejectBlock){
        resolve(CSSearchableIndex.isIndexingAvailable())
    }
    
    /// create dictionary to CSSearchableItem
    func createSearchableItem(item: [String: Any],
                              completion: @escaping  (CSSearchableItem) -> () ){
        
        var domain = Bundle.main.bundleIdentifier
        if let d = item[SearchItemKey.domain] as? String{
            domain = d
        }
        
        let attr = CSSearchableItemAttributeSet.init(itemContentType: kCIAttributeTypeImage)
        attr.title = item[SearchItemKey.title] as? String
        attr.contentDescription = item[SearchItemKey.description] as? String
        attr.keywords = item[SearchItemKey.keywords] as? [String]
        attr.domainIdentifier = domain
        
        let callCalback = { () in
            let item = CSSearchableItem.init(uniqueIdentifier: item[SearchItemKey.id] as? String,
                                             domainIdentifier: domain,
                                             attributeSet: attr)
            completion(item)
        }
        
        if let imageUrl = item[SearchItemKey.imageUrl] as? String{
            AF.request(imageUrl, method: .get).responseImage { response in
                if case .success(let image) = response.result {
                    attr.thumbnailData = image.pngData()
                }
                callCalback()
            }
        }else{
            callCalback()
        }
    }
    
    @objc
    func addSearchableItems(_ items: [[String: Any]],
                            resolver resolve: @escaping RCTPromiseResolveBlock,
                            rejecter reject: @escaping RCTPromiseRejectBlock){
        var error: Error? = nil
        let maxSubLength: Int = 100
        let loop = items.count/maxSubLength + 1
        let group = DispatchGroup()
        let queue = DispatchQueue(label: "search_with_spotlight.addSearchableItems")
        for _ in 0..<loop{
          group.enter()
        }
        for index in 0..<loop{
          queue.async(group: group){ [weak self] in
            let startIndex = index*maxSubLength
            let endIndex = (index+1)*maxSubLength
            let subItems = items.safeSubArray(range: startIndex..<endIndex)
            if subItems.count == 0{
                group.leave()
            }else{
                self?.registerItems(subItems, completion: { (_error) in
                    if error != nil{
                        error = _error
                    }
                    group.leave()
                })
            }
          }
        }
        group.notify(queue: .main) {
            if let error = error{
                reject("SearchWithSpotlight#addSearchableItem",
                       error.localizedDescription,
                       error)
            }else{
                resolve(nil)
            }
        }
    }
    
    /**
     register items at Spotlight
     */
    private func registerItems(_ items: [[String: Any]],
                               completion: @escaping (Error?) -> ()){
        var searchableItems = [CSSearchableItem]()
        let group = DispatchGroup()
        let queue = DispatchQueue(label: "search_with_spotlight.registerItems",
                                  attributes: .concurrent)
        for _ in items{
            group.enter()
        }
        queue.async(group:group){ [weak self] in
            for item in items{
                self?.createSearchableItem(item: item, completion: { (searchableItem) in
                    searchableItems.append(searchableItem)
                    group.leave()
                })
            }
        }
        group.notify(queue: .main) {
            let searchableIndex = CSSearchableIndex.default()
            searchableIndex.indexSearchableItems(searchableItems) { (error) in
                completion(error)
            }
        }
    }
    
    @objc
    func deleteAll(_ resolve: @escaping RCTPromiseResolveBlock,
                   rejecter reject: @escaping RCTPromiseRejectBlock){
        let searchableIndex = CSSearchableIndex.default()
        searchableIndex.deleteAllSearchableItems { (error) in
            if let error = error{
                reject("SearchWithSpotlight#deleteAll",
                       error.localizedDescription,
                       error)
            }else{
                resolve(nil)
            }
        }
    }
    
    @objc
    func deleteIdentifiers(_ identifiers: [String],
                           resolver resolve: @escaping RCTPromiseResolveBlock,
                           rejecter reject: @escaping RCTPromiseRejectBlock){
        let searchableIndex = CSSearchableIndex.default()
        searchableIndex.deleteSearchableItems(withIdentifiers: identifiers) { (error) in
            if let error = error{
                reject("SearchWithSpotlight#deleteIdentifiers",
                       error.localizedDescription,
                       error)
            }else{
                resolve(nil)
            }
        }
    }
    
    @objc
    func deleteDomains(_ domains: [String],
                       resolver resolve: @escaping RCTPromiseResolveBlock,
                       rejecter reject: @escaping RCTPromiseRejectBlock){
        let searchableIndex = CSSearchableIndex.default()
        searchableIndex.deleteSearchableItems(withDomainIdentifiers: domains) { (error) in
            if let error = error{
                reject("SearchWithSpotlight#deleteDomains",
                       error.localizedDescription,
                       error)
            }else{
                resolve(nil)
            }
        }
    }
    
}

extension Array {
    func safeSubArray(range: Range<Int>) -> Array<Element> {
        let length = (range.endIndex > range.startIndex) ? (range.endIndex - range.startIndex) : 0
        return self.dropFirst(range.startIndex).prefix(length).map{$0}
    }
}
