import ExpoModulesCore
import UIKit

class ZSWindowObserverView: ExpoView {
  let onWindowLayoutChange = EventDispatcher()

  private var lastPayload: [String: AnyHashable]?

  private let readableProbe = UILayoutGuide()

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)

    addLayoutGuide(readableProbe)
    NSLayoutConstraint.activate([
      readableProbe.leadingAnchor.constraint(equalTo: readableContentGuide.leadingAnchor),
      readableProbe.trailingAnchor.constraint(equalTo: readableContentGuide.trailingAnchor),
      readableProbe.topAnchor.constraint(equalTo: topAnchor),
      readableProbe.heightAnchor.constraint(equalToConstant: 0),
    ])

    if #available(iOS 17.0, *) {
      registerForTraitChanges([UITraitHorizontalSizeClass.self, UITraitVerticalSizeClass.self, UITraitPreferredContentSizeCategory.self]) {
        (view: ZSWindowObserverView, _: UITraitCollection) in
        view.setNeedsLayout()
      }
    }
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    emitIfChanged()
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    setNeedsLayout()
  }

  override func layoutMarginsDidChange() {
    super.layoutMarginsDidChange()
    setNeedsLayout()
  }

  override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
    super.traitCollectionDidChange(previousTraitCollection)
    if #unavailable(iOS 17.0) {
      setNeedsLayout()
    }
  }

  private func emitIfChanged() {
    let size = bounds.size
    guard window != nil, size.width > 0, size.height > 0 else {
      return
    }

    var payload: [String: AnyHashable] = [
      "width": Double(size.width),
      "height": Double(size.height),
      "horizontalSizeClass": Self.name(of: traitCollection.horizontalSizeClass),
      "verticalSizeClass": Self.name(of: traitCollection.verticalSizeClass),
      "readableWidth": Double(readableProbe.layoutFrame.width),
    ]
    if let features = displayFeatures() {
      payload["displayFeatures"] = features
    }
    guard payload != lastPayload else {
      return
    }
    lastPayload = payload
    onWindowLayoutChange(payload)
  }

  private func displayFeatures() -> [AnyHashable]? {
    #if canImport(UIKit, _version: 9127.0.85)
    if #available(iOS 27.1, *) {
      let folds = reservedRegions(kind: .division, options: .includeInactive).map { Self.feature($0, type: "fold") }
      let occlusions = reservedRegions(kind: .occlusion, options: .includeInactive).map { Self.feature($0, type: "occlusion") }
      return folds + occlusions
    }
    #endif
    return nil
  }

  #if canImport(UIKit, _version: 9127.0.85)
  @available(iOS 27.1, *)
  private static func feature(_ region: UIView.ReservedRegion, type: String) -> AnyHashable {
    let frame = region.frame
    let isFold = type == "fold"
    let payload: [String: AnyHashable] = [
      "type": type,
      "x": Double(frame.minX),
      "y": Double(frame.minY),
      "width": Double(frame.width),
      "height": Double(frame.height),
      "orientation": frame.height >= frame.width ? "vertical" : "horizontal",
      "state": isFold ? (region.isActive ? "halfOpened" : "flat") : "unknown",
      "active": region.isActive,
    ]
    return payload
  }
  #endif

  private static func name(of sizeClass: UIUserInterfaceSizeClass) -> String {
    return sizeClass == .regular ? "regular" : "compact"
  }
}
