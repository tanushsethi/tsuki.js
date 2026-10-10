export type TsukiElement = {
  type: string | TsukiComponent;
  props: {
    [key: string]: unknown;
    children: TsukiElement[];
  };
};

export type TsukiComponent = (props: TsukiElement["props"]) => TsukiElement;

export type TsukiTextSource = () => string | number;

export type TsukiChild = TsukiElement | string | number | TsukiTextSource;
