import ExpoModulesCore
import UIKit

public class ZsUiModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ZsUi")

    Constant("viewControllerBasedStatusBarAppearance") {
      Bundle.main.object(forInfoDictionaryKey: "UIViewControllerBasedStatusBarAppearance") as? Bool ?? true
    }

    // Dynamic Island iPhones report a top safe area taller than the status bar (62 vs 54), so overlays that sit
    // right below the status bar need its own frame. UIKit state is read on the main queue.
    AsyncFunction("getStatusBarFrame") { () -> [String: Double]? in
      let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
      let scene = scenes.first { $0.windows.contains { $0.isKeyWindow } } ?? scenes.first
      guard let frame = scene?.statusBarManager?.statusBarFrame else {
        return nil
      }
      return ["x": Double(frame.minX), "y": Double(frame.minY), "width": Double(frame.width), "height": Double(frame.height)]
    }.runOnQueue(.main)

    View(ZSWindowObserverView.self) {
      Events("onWindowLayoutChange")
    }

    View(ZSTabSidebarObserverView.self) {}

    View(ZSSheetContentView.self) {}

    View(ZSSelectMenuView.self) {
      Events("onSelectOption")

      Prop("options") { (view: ZSSelectMenuView, options: [String]) in
        view.options = options
      }
      Prop("selectedIndex") { (view: ZSSelectMenuView, index: Int) in
        view.selectedIndex = index
      }
      Prop("placeholder") { (view: ZSSelectMenuView, placeholder: String?) in
        view.placeholder = placeholder
      }
      Prop("enabled") { (view: ZSSelectMenuView, enabled: Bool) in
        view.enabled = enabled
      }
      Prop("menuAccessibility") { (view: ZSSelectMenuView, info: [String: String]) in
        view.setAccessibility(label: info["label"], value: info["value"], hint: info["hint"])
      }
    }

    View(ZSTopBarView.self) {
      Events("onBarLayoutChange")

      Prop("extent") { (view: ZSTopBarView, extent: Double) in
        view.extent = CGFloat(extent)
      }
    }
  }
}
