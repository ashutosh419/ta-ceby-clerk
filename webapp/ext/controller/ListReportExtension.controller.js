sap.ui.define(
  ["sap/ui/core/mvc/ControllerExtension"],
  function (ControllerExtension) {
    "use strict";

    return ControllerExtension.extend(
      "zcebyclerk.ext.controller.ListReportExtension",
      {
        // this section allows to extend lifecycle hooks or hooks provided by Fiori elements
        override: {
          /**
           * Called when a controller is instantiated and its View controls (if available) are already created.
           * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
           * @memberOf zcebyclerk.ext.controller.ListReportExtension
           */
          onBeforeRendering: function () {
            let oView = this.base.getView();

            // Attach Event on First Data Load to adjust the View Settings
            let oModel = oView.getModel();
            if (oModel) {
              oModel.attachEventOnce("dataReceived", async () => {
                const sTable =
                  "zcebyclerk::HeaderList--fe::table::Header::LineItem::Table";
                const oTable = oView.byId(sTable);
                if (!oTable) {
                  return;
                }
                const oMDCTable = oTable.getMDCTable();
                const oListBinding = oTable.getRowBinding();
                let oFirstRow;

                oTable.setBusyIndicatorDelay(0).setBusy(true);
                // Fetch the First Row of Header with FC fields
                const aContexts = oListBinding.getContexts();
                if (aContexts.length > 0) {
                  oFirstRow = await oModel
                    .bindContext(aContexts[0].getPath())
                    .requestObject();
                }
                // Setting Column Visibility

                const aColumns = oMDCTable.getColumns();
                aColumns.forEach((oColumn, i) => {
                  const sProperty = oColumn.getPropertyKey();
                  if (sProperty.length > 0) {
                    const bHidden = oFirstRow[sProperty + "_fc_wl"];
                    if (bHidden) {
                      oMDCTable.removeColumn(oColumn);
                    } else {
                      // Not to be hidden
                      // Check for Label Change
                      const sLabel = oFirstRow[sProperty + "_label_wl"];
                      if (sLabel && sLabel.length > 0) {
                        oColumn.setHeader(sLabel);
                      }
                    }
                  }
                });
                oTable.setBusy(false);
              });
            }
          },
        },
      }
    );
  }
);
