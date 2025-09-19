import { IconType } from "react-icons";


export interface FeatureType {
  title: string;
  Icon: IconType;
  description: string;
}

export interface FeatureProps extends FeatureType {
  position: number;
  index: number;
}