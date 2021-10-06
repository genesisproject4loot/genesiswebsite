import { ReactElement } from "react";

type OpenseaLinkProps = { address: string; tokenid: number; text: string };

export function OpenseaLink(props: OpenseaLinkProps): ReactElement {
  return (
    <a
      href={
        "//opensea.io" +
        (props.tokenid ? "/assets" : "") +
        "/" +
        props.address +
        (props.tokenid ? "/" + props.tokenid : "")
      }
      target="_blank"
      rel="noopener noreferrer"
    >
      {props.text}
    </a>
  );
}
