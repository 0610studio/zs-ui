import ExpoModulesCore
import UIKit

/**
 자식(SwiftUI 시트를 띄우는 Host)을 지금 맨 위에 떠 있는 뷰 컨트롤러에 붙인다.
 SwiftUI 시트는 Host 가 속한 뷰 컨트롤러에서 띄워진다. 앱 루트의 Host 는 루트 컨트롤러에 속해, 루트가 이미 띄운 모달·formSheet 가 있으면
 그것을 내리고 시트를 띄웠다(iOS 27.2 실측). 맨 위 컨트롤러(모달·formSheet·먼저 띄운 시트)에 붙이면 그 위에 시트가 겹쳐 뜬다.
 맨 위가 이 뷰를 담은 화면이면 지금처럼 이 뷰 안에 둔다.
 */
final class ZSPresentationAnchorView: ExpoView {
  let onDetach = EventDispatcher()
  private var hosted: [UIView] = []
  private var portal: ZSPresentationPortalView?

  override func mountChildComponentView(_ childComponentView: UIView, index: Int) {
    hosted.insert(childComponentView, at: min(max(index, 0), hosted.count))
    if window != nil {
      container().addSubview(childComponentView)
    }
  }

  override func unmountChildComponentView(_ childComponentView: UIView, index: Int) {
    hosted.removeAll { $0 === childComponentView }
    childComponentView.removeFromSuperview()
    if hosted.isEmpty {
      portal?.removeFromSuperview()
      portal = nil
    }
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    // 붙일 곳은 창에 들어온 뒤에야 안다 — 그 전에 Host 를 이 뷰에 넣으면 루트 컨트롤러에서 시트가 먼저 떠 버린다
    guard window != nil else {
      return
    }
    for child in hosted where child.superview == nil {
      container().addSubview(child)
    }
  }

  fileprivate func portalDidDetach() {
    onDetach([:])
  }

  private func container() -> UIView {
    if let portal {
      return portal
    }
    guard let target = Self.topController(in: window), let targetView = target.viewIfLoaded, !isDescendant(of: targetView) else {
      return self
    }
    let portal = ZSPresentationPortalView(owner: self, target: target)
    targetView.addSubview(portal)
    self.portal = portal
    return portal
  }

  /// 창에서 맨 위에 떠 있는 컨트롤러 — 닫히는 중인 것과 시스템 경고창은 건너뛰고, 내비게이션·탭은 보이는 화면으로 내려간다
  static func topController(in window: UIWindow?) -> UIViewController? {
    var top = window?.rootViewController
    while let presented = top?.presentedViewController, !presented.isBeingDismissed, !(presented is UIAlertController) {
      top = presented
    }
    while true {
      if let navigation = top as? UINavigationController, let visible = navigation.topViewController {
        top = visible
      } else if let tabs = top as? UITabBarController, let selected = tabs.selectedViewController {
        top = selected
      } else {
        return top
      }
    }
  }
}

/// 맨 위 컨트롤러의 뷰 안에서 Host 를 담는 빈 뷰. 그 컨트롤러가 닫히면 위에 띄운 시트도 함께 내려가므로 anchor 에 알린다.
final class ZSPresentationPortalView: UIView {
  private weak var owner: ZSPresentationAnchorView?
  private weak var target: UIViewController?

  init(owner: ZSPresentationAnchorView, target: UIViewController) {
    self.owner = owner
    self.target = target
    super.init(frame: .zero)
    isUserInteractionEnabled = false
  }

  @available(*, unavailable)
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    // anchor 가 직접 뗀 경우(superview nil)는 알리지 않는다
    guard window == nil, superview != nil else {
      return
    }
    DispatchQueue.main.async { [weak self] in
      guard let self, self.window == nil, self.superview != nil, Self.isDismissed(self.target) else {
        return
      }
      self.owner?.portalDidDetach()
    }
  }

  private static func isDismissed(_ controller: UIViewController?) -> Bool {
    guard var root = controller else {
      return true
    }
    while let parent = root.parent {
      root = parent
    }
    return root.viewIfLoaded?.window == nil && (root.presentingViewController == nil || root.isBeingDismissed)
  }
}
