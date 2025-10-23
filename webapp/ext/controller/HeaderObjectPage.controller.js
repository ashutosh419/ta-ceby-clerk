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
            let oView = this.base.getView();
            let oModel = oView.getModel();
            let oHeaderData;

            //Start of change to manage visibility of Workflow button based on Status
            const fnUpdate = async () => {
              const oCtx = oView.getBindingContext();
              if (oCtx) {
                const oData = await oCtx.requestObject();
                const oBtn = oView.byId("zcebyclerk::HeaderObjectPage--fe::CustomAction::wfSend");
                if (oBtn) {
                  const aHiddenStatuses = ["06", "07", "08"];
                  oBtn.setVisible(!aHiddenStatuses.includes(oData.Status));
                }
              }
            };

            oView.attachModelContextChange(fnUpdate);
            //End of change to manage visibility of Workflow button based on Status

            if (oModel) {
              oModel.attachEventOnce("dataReceived", async (oEvent) => {
                // Fetch Invoice Facet

                let oInvoiceFacet = oView.byId(
                  "zcebyclerk::HeaderObjectPage--fe::FormContainer::InvoiceFacet"
                );
                let oContext = oEvent.getSource().getContext();
                if (oContext) {
                  oHeaderData = await oModel
                    .bindContext(oContext.getPath())
                    .requestObject();
                }

                if (oInvoiceFacet && oHeaderData) {
                  let aFormElements = oInvoiceFacet.getFormElements();
                  aFormElements.forEach((oFormElement) => {
                    if (oFormElement) {
                      let aFields = oFormElement.getFields();
                      if (aFields.length > 0) {
                        let oFirstField = aFields[0];
                        if (oFirstField) {
                          let sMainPropertyRelativePath =
                            oFirstField.getMainPropertyRelativePath();
                          // UPdate Label from Property + '_label_wd' field

                          const sLabel =
                            oHeaderData[
                            sMainPropertyRelativePath + "_label_wd"
                            ];
                          if (sLabel && sLabel.length > 0) {
                            oFormElement.setLabel(sLabel);
                          }
                        }
                      }
                    }
                  });
                }
              });
            }
          },
        },
      }
    );
  }
);
