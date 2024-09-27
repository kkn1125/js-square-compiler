const playground = document.getElementById("playground");
const origin = document.getElementById("origin");
const lexer = document.getElementById("lexer");
const parser = document.getElementById("parser");
const transformer = document.getElementById("transformer");
const generator = document.getElementById("generator");
const board = document.getElementById("board");

const url = import.meta.url;
const params = Object.fromEntries(
  new URLSearchParams(url.slice(url.indexOf("?"))).entries()
);

import compiler from "./compiler.js";

playground.onkeyup = (e) => {
  writeProcesses();
};

function writeProcesses(original) {
  if (original) {
    playground.value = original;
  }
  origin.value = playground.value;
  const lex = compiler.lexer(playground.value);
  lexer.value = JSON.stringify(lex, null, 2);
  const pars = compiler.parser(lex);
  parser.value = JSON.stringify(pars, null, 2);
  const transform = compiler.transformer(pars);
  transformer.value = JSON.stringify(transform, null, 2);
  const generate = compiler.generator(transform);
  generator.value = generate;
  board.innerHTML = generator.value;
}

const res = await fetch(params.rect + ".rect");
const rect = await res.text();

writeProcesses(rect);

// const localConstructor = class extends HTMLElement {
//   constructor() {
//     super();
//     let template = document.createElement("template");
//     template.innerHTML = `
//       <style>
//         details {
//           font-family: "Open Sans Light", Helvetica, Arial, sans-serif;
//         }
//         .name {
//           font-weight: bold;
//           color: #217ac0;
//           font-size: 120%;
//         }
//         h4 {
//           margin: 10px 0 -8px 0;
//           background: #217ac0;
//           color: white;
//           padding: 2px 6px;
//           border: 1px solid #cee9f9;
//           border-radius: 4px;
//         }
//         .attributes {
//           margin-left: 22px;
//           font-size: 90%;
//         }
//         .attributes p {
//           margin-left: 16px;
//           font-style: italic;
//         }
//       </style>
//       <details>
//         <summary>
//           <code class="name">
//             &lt;<slot name="element-name">NEED NAME</slot>&gt;
//           </code>
//           <span class="desc"
//             ><slot name="description">NEED DESCRIPTION</slot></span
//           >
//         </summary>
//         <div class="attributes">
//           <h4>Attributes</h4>
//           <slot name="attributes"><p>None</p></slot>
//         </div>
//       </details>
//       <hr />`;
//     let templateContent = template.content;

//     const shadowRoot = this.attachShadow({ mode: "closed" });
//     shadowRoot.appendChild(templateContent.cloneNode(true));
//   }
// };

// customElements.define("element-details-template", localConstructor);
