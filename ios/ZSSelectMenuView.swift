import ExpoModulesCore
import UIKit

/// ZSSelect iOS 메뉴 — 칸(RN) 위를 덮는 투명 UIButton 이 UIKit 메뉴(UIMenu)를 연다.
/// SwiftUI Menu 는 iOS 26 에서 열고 닫힐 때 라벨을 유리 면으로 바꿔 끌어올리고 접어 넣어 아래 칸이 굴절돼 보였다.
class ZSSelectMenuView: ExpoView {
  let onSelectOption = EventDispatcher()

  private let button = ZSSelectMenuButton(type: .custom)

  var options: [String] = [] {
    didSet { rebuildMenu() }
  }

  var selectedIndex: Int = -1 {
    didSet { rebuildMenu() }
  }

  var placeholder: String? {
    didSet { rebuildMenu() }
  }

  var enabled: Bool = true {
    didSet { button.isEnabled = enabled }
  }

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    backgroundColor = .clear
    button.backgroundColor = .clear
    button.showsMenuAsPrimaryAction = true
    button.frame = bounds
    button.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    addSubview(button)
    rebuildMenu()
  }

  func setAccessibility(label: String?, value: String?, hint: String?) {
    button.accessibilityLabel = label
    button.accessibilityValue = value
    button.accessibilityHint = hint
  }

  private func rebuildMenu() {
    var children: [UIMenuElement] = []
    // 선택 전이면 맨 위에 선택 전 자리를 체크해 둔다(고르면 빠진다) — 이전 SwiftUI Picker 와 같은 동작
    if selectedIndex < 0 {
      children.append(UIAction(title: placeholder ?? "—", state: .on) { _ in })
    }
    for (index, title) in options.enumerated() {
      children.append(
        UIAction(title: title, state: index == selectedIndex ? .on : .off) { [weak self] _ in
          self?.onSelectOption(["index": index])
        }
      )
    }
    button.menu = UIMenu(children: children)
  }
}

/// 메뉴가 펼쳐지고 접히는 기준을 칸 전체가 아니라 칸 아래 가장자리 가운데의 보이지 않는 1pt 점으로 둔다.
/// iOS 26 은 메뉴 유리 면을 기준 뷰 모양으로 펼치고 접어 넣는데, 칸 전체가 기준이면 유리 면이 칸 위를 지나며 굴절시킨다.
private final class ZSSelectMenuButton: UIButton {
  private let anchor = UIView()

  override init(frame: CGRect) {
    super.init(frame: frame)
    anchor.isUserInteractionEnabled = false
    anchor.backgroundColor = .clear
    addSubview(anchor)
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    anchor.frame = CGRect(x: bounds.midX - 0.5, y: bounds.maxY - 1, width: 1, height: 1)
  }

  override func menuAttachmentPoint(for configuration: UIContextMenuConfiguration) -> CGPoint {
    CGPoint(x: bounds.midX, y: bounds.maxY)
  }

  private func anchorPreview() -> UITargetedPreview {
    let parameters = UIPreviewParameters()
    parameters.backgroundColor = .clear
    return UITargetedPreview(view: anchor, parameters: parameters)
  }

  override func contextMenuInteraction(
    _ interaction: UIContextMenuInteraction,
    configuration: UIContextMenuConfiguration,
    highlightPreviewForItemWithIdentifier identifier: any NSCopying
  ) -> UITargetedPreview? {
    anchorPreview()
  }

  override func contextMenuInteraction(
    _ interaction: UIContextMenuInteraction,
    configuration: UIContextMenuConfiguration,
    dismissalPreviewForItemWithIdentifier identifier: any NSCopying
  ) -> UITargetedPreview? {
    anchorPreview()
  }
}
