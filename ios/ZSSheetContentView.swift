import ExpoModulesCore
import UIKit

// 콘텐츠 팬이 시트 팬보다 먼저 인식되어 손잡이에서만 시트를 끌 수 있습니다.
class ZSSheetContentView: ExpoView, UIGestureRecognizerDelegate {
  private let shield = UIPanGestureRecognizer()

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    shield.cancelsTouchesInView = false
    shield.delaysTouchesBegan = false
    shield.delaysTouchesEnded = false
    shield.delegate = self
    addGestureRecognizer(shield)
  }

  func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldBeRequiredToFailBy otherGestureRecognizer: UIGestureRecognizer) -> Bool {
    isOutsidePan(otherGestureRecognizer)
  }

  func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
    !isOutsidePan(otherGestureRecognizer)
  }

  private func isOutsidePan(_ recognizer: UIGestureRecognizer) -> Bool {
    guard recognizer is UIPanGestureRecognizer, let view = recognizer.view else {
      return false
    }
    return !view.isDescendant(of: self)
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    #if canImport(UIKit, _version: 9127.0.85)
    if #available(iOS 27.1, *), window != nil, let sheet = presentedController() {
      SheetVerticalBarFollower.follow(sheet)
    }
    #endif
  }

  /// 이 콘텐츠를 담은 시트 컨트롤러 — 응답 사슬에서 처음 만나는 뷰 컨트롤러부터 부모를 따라 올라가 presentation 된 것
  private func presentedController() -> UIViewController? {
    var responder: UIResponder? = next
    while let current = responder, !(current is UIViewController) {
      responder = current.next
    }
    var controller = responder as? UIViewController
    while let current = controller {
      if current.presentingViewController != nil {
        return current
      }
      controller = current.parent
    }
    return nil
  }
}

#if canImport(UIKit, _version: 9127.0.85)
/**
 시트는 띄운 화면의 세로 바 설정을 따른다.
 앱이 세로 바를 끄면(StatusBar.setVerticalBarBehaviorIOS('disabled') — barAxis horizontal) expo-status-bar 가 UIViewController 기본 구현을 바꾸지만,
 SwiftUI 시트 컨트롤러(PresentationHostingController)는 preferredVerticalBarBehavior 를 스스로 정해(automatic), 시트 안 내용이 세로 레일 폭만큼 안쪽으로 밀렸다.
 SwiftUI·UIKit 에 시트 쪽 공개 설정이 없어 그 클래스의 getter 가 띄운 화면의 값을 돌려주게 한다 — UIKit 시트(react-native-screens formSheet)와 같은 값.
 상태바가 세로 자리로 옮겨 가는 것은 세로 바를 끈 UIKit 시트에서도 같아 시스템 동작이다(iPhone Duo, iOS 27.1 실측).
 */
@available(iOS 27.1, *)
@MainActor
enum SheetVerticalBarFollower {
  private static var installedClasses = Set<ObjectIdentifier>()

  static func follow(_ sheet: UIViewController) {
    install(on: type(of: sheet))
    sheet.setNeedsUpdateOfVerticalBarConfiguration()
  }

  private static func resolved(_ controller: UIViewController) -> UIVerticalBarBehavior {
    var current = controller
    while let child = current.childForPreferredVerticalBarBehavior {
      current = child
    }
    return current.preferredVerticalBarBehavior
  }

  private static func install(on cls: AnyClass) {
    let selector = #selector(getter: UIViewController.preferredVerticalBarBehavior)
    guard installedClasses.insert(ObjectIdentifier(cls)).inserted, let method = class_getInstanceMethod(cls, selector) else {
      return
    }
    typealias Getter = @convention(c) (UIViewController, Selector) -> UIVerticalBarBehavior
    let original = unsafeBitCast(method_getImplementation(method), to: Getter.self)
    let implementation: @convention(block) (UIViewController) -> UIVerticalBarBehavior = { controller in
      if let presenter = controller.presentingViewController {
        return resolved(presenter)
      }
      return original(controller, selector)
    }
    let replacement = imp_implementationWithBlock(implementation)
    if !class_addMethod(cls, selector, replacement, method_getTypeEncoding(method)) {
      method_setImplementation(method, replacement)
    }
  }
}
#endif
