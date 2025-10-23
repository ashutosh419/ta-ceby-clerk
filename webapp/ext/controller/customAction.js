sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
], function (MessageToast, Fragment) {
    'use strict';
    var oWFDialog;
    return {
        //zcebyclerk::HeaderObjectPage--fe::CustomAction::wfSend  => ID of the action button
        openSendToWorkflow: function (oEvent) {
            var oView = this.getRouting().getView();
            var oModel = this.getModel()
            if (!oWFDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "zcebyclerk.ext.fragment.WorkflowParameters",
                    controller: this
                }).then(function (oDialog) {
                    oWFDialog = oDialog;
                    oView.addDependent(oDialog);
                    oDialog.setModel(oModel);
                    oDialog.open();
                }.bind(this));
            } else {
                oWFDialog.setModel(oModel);
                oWFDialog.open();
            }
        },
        onSubmitWorkflow: function (oEvent) {
            var oView = this.getRouting().getView();
            const oSource = oEvent.getSource();
            const oContext = oSource.getBindingContext();

            if (!oContext) {
                MessageBox.error(
                    "Cannot find the binding context to call the action."
                );
                return;
            }
            var oModel = oContext.getModel();
            const oAction = oContext
                .getModel()
                .bindContext(
                    "com.sap.gateway.srvd.zceby_iv_ui_hdr.v0001.SendToWorkflow(...)",
                    oContext
                );


            if (!oView.byId("cbWFID").getSelectedKey()) {
                sap.m.MessageToast.show("Please Select Workflow ID");
                return;
            }
            if (!oView.byId("idWFDueDate").getDateValue()) {
                sap.m.MessageToast.show("Date defaulted to 9999-12-31");
                return;
            }
            if (!oView.byId("workflowStepsTable").getModel("stepsModel") || 
                oView.byId("workflowStepsTable").getModel("stepsModel").getData().length == 0) {
                sap.m.MessageToast.show("No Workflow Steps to Proceed");
                return;
            }


            var aSteps = oView.byId("workflowStepsTable").getModel("stepsModel").getData().Steps.map(step => ({
                StepId: step.StepId,
                StepPosition: String(step.Pos),
                WorkflowReceivers: step.Receivers.map(r => ({
                    UserType: r.Type,
                    UserId: r.Receiver,
                    UserFullName: r.FullName
                }))
            }));


            oAction.setParameter("WorkflowID", oView.byId("cbWFID").getSelectedKey());
            oAction.setParameter("WorkflowDueDate", oView.byId("idWFDueDate").getDateValue().toISOString().slice(0, 10));
            oAction.setParameter("WorkflowSteps", aSteps);

            oAction.invoke().then(function (oResult) {
                sap.m.MessageToast.show("Workflow sent successfully!");
                oView.byId("zcebyclerk::HeaderObjectPage--fe::CustomAction::wfSend").setVisible(false);
                oContext.refresh(); 
            }).catch(function (oError) {
                console.log(oError.message);
                sap.m.MessageBox.error("Error sending workflow: " + oError.message);
            });

            oWFDialog.close();
            oView.byId("cbWFID").clearSelection();
            oView.byId("idWFDueDate").setValue();
            oView.byId("workflowStepsTable").getModel("stepsModel").setData([]);
            oView.byId("workflowReceiversTable").getModel("receiversModel").setData([]);
            MessageToast.show("Workflow Sent.");
        },
        onCancelWorkflowSend: function (oEvent) {
            var oView = this.getRouting().getView();
            oWFDialog.close();
            oView.byId("cbWFID").clearSelection();
            oView.byId("idWFDueDate").setValue();
            oView.byId("workflowStepsTable").getModel("stepsModel").setData([]);
            oView.byId("workflowReceiversTable").getModel("receiversModel").setData([]);
            MessageToast.show("Workflow Sending Cancelled");
        },
        onWorkflowIDSelected: function (oEvent) {
            var oView = this.getRouting().getView();
            var boundRow = oEvent.getParameter("selectedItem");
            var workflowId = boundRow.getKey();
            var workflowDueDays = boundRow.getBindingContext().getObject().WcDueDays;
            var oModel = oEvent.getSource().getModel();

            var oDate = new Date();
            oDate.setDate(oDate.getDate() + parseInt(workflowDueDays));
            oView.byId("idWFDueDate").setDateValue(oDate);

            // Create ListBinding for /WorkflowSteps with filter
            var oListBinding = oModel.bindList("/WorkflowSteps", null, null,
                new sap.ui.model.Filter("WcId", sap.ui.model.FilterOperator.EQ, workflowId)
            );

            oListBinding.requestContexts().then(function (aContexts) {
                if (!aContexts.length) {
                    sap.m.MessageToast.show("No steps found for workflow " + workflowId);
                    oView.byId("workflowStepsTable").setModel(new sap.ui.model.json.JSONModel([]), "stepsModel");
                    return;
                }

                // Extract plain JS objects
                var aSteps = aContexts.map(function (oCtx) {
                    return oCtx.getObject();
                });

                // Build lookup for Previous → Current
                var mSteps = {};
                aSteps.forEach(function (step) {
                    mSteps[step.WcPrevStepId] = step.WcStepId;
                });

                // Find the start (where Previous is empty)
                var oStart = aSteps.find(function (s) { return !s.WcPrevStepId; });
                if (!oStart) {
                    sap.m.MessageToast.show("Could not determine start step.");
                    oView.byId("workflowStepsTable").setModel(new sap.ui.model.json.JSONModel([]), "stepsModel");
                    return;
                }

                // Chain sequence
                var sequence = [];
                var curr = oStart.WcStepId;
                var pos = 1;
                while (curr) {
                    //Currently receivers are hard-coded, later they will be replaced with actual business logic
                    sequence.push({
                        Pos: pos++, StepId: curr, Receivers: [{ "Type": "S", "Receiver": "TEWARI", "FullName": "Deepak Tewari" }]
                    });
                    curr = mSteps[curr];
                }

                // Store in local JSON model for table binding
                var oStepsModel = new sap.ui.model.json.JSONModel({ Steps: sequence });
                oView.byId("workflowStepsTable").setModel(oStepsModel, "stepsModel");
            }).catch(function (oError) {
                sap.m.MessageBox.error("Error reading WorkflowSteps: " + oError.message);
            });
        },
        onStepSelectionChange: function (oEvent) {
            var oView = this.getRouting().getView();
            var oSelectedItem = oEvent.getParameter("listItem");
            var oContext = oSelectedItem.getBindingContext("stepsModel");
            var aReceivers = oContext.getObject().Receivers;
            oView.byId("workflowReceiversTable").setModel(new sap.ui.model.json.JSONModel({ Receiver: aReceivers }), "receiversModel");
        },
        onAddReceiver: function () {
            var oView = this.getRouting().getView();
            var oReceiversTable = oView.byId("workflowReceiversTable");
            oReceiversTable.addItem();
        }
    };
});
