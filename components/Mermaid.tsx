import { useState, useEffect } from 'react';

let currentId = 0;
const uuid = () => `mermaid-${(currentId++).toString()}`;

declare global {
  interface Window {
    mermaid: {
      mermaidAPI: {
        render(
          id: string,
          txt: string,
          cb?: (
              svgCode: string,
              bindFunctions: (element: Element) => void
          ) => void,
          container?: Element
        ): string;
      }
    }
  }
}

const Mermaid = ({ graphDefinition }) => {
  const [html, setHtml] = useState('');
  useEffect(() => {
    if (graphDefinition) {
      try {
        window.mermaid.mermaidAPI.render(uuid(), graphDefinition, svgCode =>
          setHtml(svgCode)
        );
      } catch (e) {
        setHtml('');
        console.error(e);
      }
    }
  }, [graphDefinition]);

  return graphDefinition ? <div dangerouslySetInnerHTML={{__html: html}} /> : null;
}

export default Mermaid;