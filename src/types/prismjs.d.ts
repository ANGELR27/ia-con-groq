declare module "prismjs" {
  const Prism: {
    highlightElement: (element: HTMLElement) => void;
    languages: {
      [key: string]: any;
    };
  };
  export default Prism;
}

declare module "prismjs/themes/prism-tomorrow.css";
declare module "prismjs/components/prism-javascript";
declare module "prismjs/components/prism-typescript";
declare module "prismjs/components/prism-jsx";
declare module "prismjs/components/prism-tsx";
declare module "prismjs/components/prism-python";
declare module "prismjs/components/prism-java";
declare module "prismjs/components/prism-c";
declare module "prismjs/components/prism-cpp";
declare module "prismjs/components/prism-csharp";
declare module "prismjs/components/prism-json";
declare module "prismjs/components/prism-css";
declare module "prismjs/components/prism-sql";
