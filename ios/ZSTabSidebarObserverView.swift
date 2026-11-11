import ExpoModulesCore
import UIKit

class ZSTabSidebarObserverView: ExpoView {
  private weak var tabBarController: UITabBarController?
  private var remainingAttempts = 0

  override func didMoveToWindow() {
    super.didMoveToWindow()
    if window == nil {
      detach()
    } else {
      remainingAttempts = 10
      attachIfNeeded()
    }
  }

  private func attachIfNeeded() {
    guard #available(iOS 18.0, *), window != nil, tabBarController == nil else {
      return
    }
    if let controller = findTabBarController() {
      if controller.sidebar.delegate == nil {
        controller.sidebar.delegate = self
        tabBarController = controller
      }
      return
    }
    guard remainingAttempts > 0 else {
      return
    }
    remainingAttempts -= 1
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
      self?.attachIfNeeded()
    }
  }

  private func detach() {
    if #available(iOS 18.0, *), let controller = tabBarController, controller.sidebar.delegate === self {
      controller.sidebar.delegate = nil
    }
    tabBarController = nil
  }

  private func findTabBarController() -> UITabBarController? {
    var responder: UIResponder? = self
    while let current = responder, !(current is UIViewController) {
      responder = current.next
    }
    guard let host = responder as? UIViewController else {
      return nil
    }
    return Self.firstTabBarController(in: host)
  }

  private static func firstTabBarController(in controller: UIViewController) -> UITabBarController? {
    for child in controller.children {
      if let tabs = child as? UITabBarController {
        return tabs
      }
      if let found = firstTabBarController(in: child) {
        return found
      }
    }
    return nil
  }

  fileprivate static func retitleUntilShown(in tabBarController: UITabBarController, attempt: Int) {
    let missing = navigationControllers(in: tabBarController.selectedViewController).filter { navigation in
      guard let title = navigation.topViewController?.navigationItem.title else {
        return false
      }
      return !containsVisibleLabel(navigation.navigationBar, text: title)
    }
    guard !missing.isEmpty, attempt < 30 else {
      return
    }
    for navigation in missing {
      if let item = navigation.topViewController?.navigationItem, let title = item.title {
        item.title = nil
        item.title = title
      }
    }
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak tabBarController] in
      guard let tabBarController else {
        return
      }
      retitleUntilShown(in: tabBarController, attempt: attempt + 1)
    }
  }

  private static func navigationControllers(in controller: UIViewController?) -> [UINavigationController] {
    guard let controller else {
      return []
    }
    let own = (controller as? UINavigationController).map { [$0] } ?? []
    return own + controller.children.flatMap { navigationControllers(in: $0) }
  }

  private static func containsVisibleLabel(_ view: UIView, text: String) -> Bool {
    if let label = view as? UILabel, label.text == text, !label.isHidden, label.alpha > 0.01 {
      return true
    }
    return view.subviews.contains { containsVisibleLabel($0, text: text) }
  }
}

@available(iOS 18.0, *)
extension ZSTabSidebarObserverView: UITabBarController.Sidebar.Delegate {
  func tabBarController(
    _ tabBarController: UITabBarController,
    sidebarVisibilityWillChange sidebar: UITabBarController.Sidebar,
    animator: any UITabBarController.Sidebar.Animating
  ) {
    animator.addCompletion { [weak tabBarController] in
      guard let tabBarController, tabBarController.sidebar.isHidden else {
        return
      }
      ZSTabSidebarObserverView.retitleUntilShown(in: tabBarController, attempt: 0)
    }
  }
}
