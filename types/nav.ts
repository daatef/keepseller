import { ComponentType, SVGProps } from "react";

export type NavItem = {
  title?: string;
  name?: string;
  url: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};
