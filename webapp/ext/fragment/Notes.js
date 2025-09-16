sap.ui.define(
  ["sap/m/MessageBox", "sap/m/MessageToast"],
  function (MessageBox, MessageToast) {
    "use strict";

    return {
      onPress: function (oEvent) {
        //   MessageToast.show("Custom handler invoked.");
        const sValue = oEvent.getParameter("value");
        if (!sValue) {
          return;
        }

        const oSource = oEvent.getSource();
        // The binding context of the fragment is the context of the Object Page
        const oContext = oSource.getBindingContext();

        if (!oContext) {
          MessageBox.error(
            "Cannot find the binding context to call the action."
          );
          return;
        }

        // The action is bound to the context of the main entity (Header)
        // The action name is 'AddNote'. The full name is prepended with the service's alias, usually 'SAP__self'.
        // const oAction = oContext
        //   .getModel()
        //   .bindContext("SAP__self.AddNote(...)", oContext);
        const oAction = oContext
          .getModel()
          .bindContext(
            "com.sap.gateway.srvd.zceby_iv_ui_hdr.v0001.AddNote(...)",
            oContext
          );

        // Set action parameters based on the provided abstract entity definition.
        // A hardcoded value is used for 'text_type'. This might need to be adapted.
        oAction.setParameter("text_type", "N1"); // Placeholder value
        oAction.setParameter("text_desc", sValue);
        oSource.getParent().setBusyIndicatorDelay(0).setBusy(true);
        // // Execute the action
        oAction
          .invoke()
          .then(
            () => {
              MessageToast.show("Note posted successfully.");
              oSource.setValue(""); // Clear the input field

              // Refresh the notes list to show the new entry.
              const oList = oSource
                .getParent()
                .getItems()
                .find((oControl) => oControl.isA("sap.m.List"));
              oList?.getBindingContext().refresh();
              oSource.getParent().setBusy(false);
            },
            (oError) => {
              oSource.getParent().setBusy(false);
              MessageToast.show("Failed to post note.");
            }
          )
          .catch((oError) => {
            MessageBox.error(`Failed to post note: ${oError.message}`);
          });
      },
    };
  }
);
