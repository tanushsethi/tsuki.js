export type TsukiElement = {
  type: string | TsukiComponent;
  props: {
    [key: string]: unknown;
    children: TsukiElement[];
  };
};

export type TsukiComponent = (props: TsukiElement["props"]) => TsukiElement;

export type TsukiChild = TsukiElement | string | number;
