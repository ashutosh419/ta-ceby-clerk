sap.ui.define(
  ["sap/ui/core/mvc/ControllerExtension"],
  function (ControllerExtension) {
    "use strict";

    return ControllerExtension.extend(
      "zcebyclerk.ext.controller.HeaderObjectPage",
      {
        // this section allows to extend lifecycle hooks or hooks provided by Fiori elements
        override: {
          /**
           * Called when a controller is instantiated and its View controls (if available) are already created.
           * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
           * @memberOf zcebyclerk.ext.controller.HeaderObjectPage
           */
          onBeforeRendering: function () {
            // you can access the Fiori elements extensionAPI via this.base.getExtensionAPI
            // able - zcebyclerk::HeaderObjectPage--fe::table::_Taxes::LineItem::Taxes-innerTable
            var oModel = this.base.getExtensionAPI().getModel();
          },
        },
      }
    );
  }
);
