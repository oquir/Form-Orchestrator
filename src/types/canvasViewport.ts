export interface ViewportInput {
  portWidth: number;
  portHeight: number;
  zoom: number;
}

// Todo en pixeles del puerto. `homeLeft`/`homeTop` son el scroll que deja el documento centrado en
// horizontal y con su borde superior a la vista.
export interface ViewportLayout {
  documentWidth: number;
  rootWidth: number;
  rootMinHeight: number;
  paddingTop: number;
  paddingBottom: number;
  homeLeft: number;
  homeTop: number;
}
