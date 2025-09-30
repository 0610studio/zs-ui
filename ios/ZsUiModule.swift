import ExpoModulesCore
import UIKit

public class ZsUiModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ZsUi")

    Events("onChange", "onFoldingStateChange")

    // (iOS는 폴딩 미사용)
    Function("getFoldingState") {
      return [
        "foldingState": "unfolding",
        "width": 0
      ]
    }

    View(ZsUiView.self) {
      Prop("name") { (view: ZsUiView, prop: String) in
        print(prop)
      }
    }
  }
}
