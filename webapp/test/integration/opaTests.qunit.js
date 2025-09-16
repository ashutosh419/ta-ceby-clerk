sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'zcebyclerk/test/integration/FirstJourney',
		'zcebyclerk/test/integration/pages/HeaderList',
		'zcebyclerk/test/integration/pages/HeaderObjectPage',
		'zcebyclerk/test/integration/pages/ItemsObjectPage'
    ],
    function(JourneyRunner, opaJourney, HeaderList, HeaderObjectPage, ItemsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('zcebyclerk') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheHeaderList: HeaderList,
					onTheHeaderObjectPage: HeaderObjectPage,
					onTheItemsObjectPage: ItemsObjectPage
                }
            },
            opaJourney.run
        );
    }
);