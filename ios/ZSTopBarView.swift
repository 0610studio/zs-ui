import ExpoModulesCore
import UIKit

class ZSTopBarView: ExpoView {
  // onTop 접두어는 Expo 이벤트 이름 변환과 충돌하므로 피합니다.
  let onBarLayoutChange = EventDispatcher()

  var extent: CGFloat = 48 {
    didSet {
      if extent != oldValue {
        setNeedsLayout()
      }
    }
  }

  private var lastPayload: [String: AnyHashable]?

  override func layoutSubviews() {
    super.layoutSubviews()
    emitIfChanged()
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()

    if window == nil {
      lastPayload = nil
    }
    setNeedsLayout()
  }

  override func safeAreaInsetsDidChange() {
    super.safeAreaInsetsDidChange()
    setNeedsLayout()
  }

  private func emitIfChanged() {
    let size = bounds.size
    guard window != nil, size.width > 0, size.height > 0 else {
      return
    }

    var payload: [String: AnyHashable] = [
      "width": Double(size.width),
      "height": Double(size.height),
      "safeAreaTop": Double(safeAreaInsets.top),
    ]
    #if canImport(UIKit, _version: 9127.0.85)
    if #available(iOS 27.1, *) {
      let bar = bounds.inset(by: edgeInsets(for: .bar(onEdge: UIRectEdge.top, extent: extent)))
      payload["bar"] = Self.rect(bar)
      if let margins = screenMargins() {
        payload["margins"] = margins
      }
    }
    #endif
    guard payload != lastPayload else {
      return
    }
    lastPayload = payload
    onBarLayoutChange(payload)
  }

  #if canImport(UIKit, _version: 9127.0.85)

  @available(iOS 27.1, *)
  private func screenMargins() -> [String: AnyHashable]? {
    guard let screen = owningViewController()?.view else {
      return nil
    }
    let margins = screen.bounds.inset(by: screen.edgeInsets(for: .margins(cornerAdaptation: .horizontal)))
    let local = convert(margins, from: screen)
    return ["left": Double(local.minX), "right": Double(bounds.width - local.maxX)]
  }
  #endif

  private func owningViewController() -> UIViewController? {
    var responder: UIResponder? = next
    while let current = responder {
      if let controller = current as? UIViewController {
        return controller
      }
      responder = current.next
    }
    return nil
  }

  private static func rect(_ rect: CGRect) -> [String: AnyHashable] {
    return ["x": Double(rect.minX), "y": Double(rect.minY), "width": Double(rect.width), "height": Double(rect.height)]
  }
}
