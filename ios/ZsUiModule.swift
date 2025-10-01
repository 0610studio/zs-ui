import ExpoModulesCore
import UIKit

public class ZsUiModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ZsUi")

    Function("getFoldingFeature") {
      return [
        "foldingFeature": nil,
        "value": 0
      ]
    }

    View(ZsUiView.self) {
      Prop("name") { (view: ZsUiView, prop: String) in
        print(prop)
      }
    }
  }
}
