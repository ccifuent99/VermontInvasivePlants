import React, { useRef, useEffect } from "react";
import { loadModules } from "esri-loader";

const Map = () => {
  const MapPt1 = useRef(null);

  useEffect(() => {
    let view;

    loadModules(
      [
        "esri/views/MapView",
        "esri/WebMap",
        "esri/layers/GeoJSONLayer",
        "esri/layers/FeatureLayer",
        "esri/widgets/Legend",
        "esri/widgets/Expand",
        "esri/smartMapping/labels/clusters",
        "esri/smartMapping/popup/clusters",
      ],
      {
        css: true,
      }
    ).then(
      ([
        MapView,
        WebMap,
        GeoJSONLayer,
        FeatureLayer,
        Legend,
        Expand,
        clusterLabelCreator,
        clusterPopupCreator,
      ]) => {
        const layer = new FeatureLayer({
          url: "https://anrmaps.vermont.gov/arcgis/rest/services/Open_Data/OPENDATA_ANR_ECOLOGIC_SP_NOCACHE_v1/MapServer/174",
          title: "Invasive Species",
          outFields: [
            "InvasiveName",
            "SiteName",
            "ChemicalName",
            "ObservationDate",
          ],
          popupTemplate: {
            title: "{InvasiveName}",
            content: [
              {
                type: "fields",
                fieldInfos: [
                  {
                    fieldName: "SiteName",
                  },
                  {
                    fieldName: "ChemicalName",
                  },
                ],
              },
            ],
          },
        });

        const webMap = new WebMap({ basemap: "topo-vector", layers: [layer] });
        const toRender = {
          type: "simple",
          field: "ObservationID",
          symbol: {
            type: "simple-marker",
            style: "circle",
            color: [50, 50, 50, 0.4],
            outline: {
              // color: [255, 255, 255, 0.3],
              width: 0.2,
            },
            size: "8px",
          },
          visualVariables: [
            {
              type: "color",
              field: "ObservationID",
              stops: [
                {
                  value: 500, // 2008
                  color: "blue",
                },
                {
                  value: 1500, //2013
                  color: "red",
                },
                {
                  value: 2500, /// 2014
                  color: "yellow",
                },
                {
                  value: 3000, /// 2018
                  color: "purple",
                },
                {
                  value: 3302, //March 23 2023
                  color: "green",
                },

                { value: 8, size: "40px" },
              ],
            },
          ],
        };
        const template = {
          title: "Treatment Information",
          content: "Plant Name: {InvasiveName} | Chemical Name: {ChemicalName}",
        };

        view = new MapView({
          map: webMap,
          center: [-72.5, 44],
          zoom: 8,
          container: MapPt1.current,
        });

        const geoJson = new GeoJSONLayer({
          url: "https://raw.githubusercontent.com/ccifuent99/geojson-collective/main/Invasive_Species.geojson",
          renderer: toRender,
        });
        webMap.add(geoJson);
        view.popup.viewModel.selectedClusterBoundaryFeature.symbol = {
          type: "simple-fill",
          style: "solid",
          color: "rgba(50,50,50,0.15)",
          outline: {
            width: 0.5,
            color: "rgba(50,50,50,0.25)",
          },
        };

        view.popup.viewModel.selectedClusterBoundaryFeature.symbol = {
          type: "simple-fill",
          style: "solid",
          color: "rgba(50,50,50,0.15)",
          outline: {
            width: 0.5,
            color: "rgba(50,50,50,0.25)",
          },
        };

        const legend = new Legend({
          view,
          container: "legendDiv",
        });

        const infoDiv = document.getElementById("infoDiv");
        view.ui.add(
          new Expand({
            view,
            content: infoDiv,
            expandIconClass: "esri-icon-layer-list",
            expanded: true,
          }),
          "top-right"
        );

        layer
          .when()
          .then(generateClusterConfig)
          .then((featureReduction) => {
            layer.featureReduction = featureReduction;

            const toggleButton = document.getElementById("toggle-cluster");
            toggleButton.addEventListener("click", toggleClustering);

            function toggleClustering() {
              let fr = layer.featureReduction;
              layer.featureReduction =
                fr && fr.type === "cluster" ? null : featureReduction;

              toggleButton.innerText =
                toggleButton.innerText === "Enable Clustering"
                  ? "Disable Clustering"
                  : "Enable Clustering";
            }

            view.whenLayerView(layer).then((layerView) => {
              const filterSelect = document.getElementById("filter");
              filterSelect.addEventListener("change", (event) => {
                const newValue = event.target.value;

                const whereClause = newValue
                  ? `InvasiveName = '${newValue}'`
                  : null;
                layerView.filter = {
                  where: whereClause,
                };
                view.popup.close();
              });
            });
          })
          .catch((error) => {
            console.error(error);
          });

        async function generateClusterConfig(layer) {
          const popupTemplate = await clusterPopupCreator
            .getTemplates({ layer })
            .then(
              (popupTemplateResponse) =>
                popupTemplateResponse.primaryTemplate.value
            );

          const { labelingInfo, clusterMinSize } = await clusterLabelCreator
            .getLabelSchemes({ layer, view })
            .then((labelSchemes) => labelSchemes.primaryScheme);

          return {
            type: "cluster",
            popupTemplate,
            labelingInfo,
            clusterMinSize,
            maxScale: 50000,
          };
        }
      }
    );

    return () => {
      if (!!view) {
        view.destroy();
        view = null;
      }
    };
  }, []);

  //add in additional plants slowly but surely && get color variability
  return (
    <div style={{ height: 800 }} ref={MapPt1}>
      <div id="infoDiv" className="esri-widget">
        Filter by Invasive Plant Species:
        <select id="filter" className="esri-select">
          <option value="">All</option>
          <option value="Common reed">Common reed</option>
          <option value="Norway maple">Norway maple</option>
          <option value="Goutweed">Goutweed</option>
          <option value="Garlic mustard">Garlic mustard</option>
          <option value="Amur maple">Amur maple</option>
          <option value="Oriental bittersweet">Oriental bittersweet</option>
          <option value="Tatarian honeysuckle">Tatarian honeysuckle </option>
        </select>
        <div>
          <button id="toggle-cluster" className="esri-button">
            Disable Clustering
          </button>
        </div>
        <div id="legendDiv"></div>
      </div>
    </div>
  );
};

export default Map;
