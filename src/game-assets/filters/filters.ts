import { FilterDefinition } from '../../_interfaces';

const OutlineFrag = `
  varying vec2 vTextureCoord;
  uniform sampler2D uSampler;

  void main(void) {
      vec4 color = texture2D(uSampler, vTextureCoord);
      float easeOutAlpha = 1.0 - pow(1.0 - color.a, 5.0);
      float easeInAlpha = pow(color.a, 5.0);
      vec3 resultOutlineColor = vec3(1.0, 0.0, 0.0) * (1.0 - color.a);
      gl_FragColor = vec4((color.rgb * 1.15 + resultOutlineColor) * easeOutAlpha, easeOutAlpha);
  }
`;

const HoverFrag = `
  precision mediump float;

  varying vec2 vTextureCoord;

  uniform sampler2D uSampler;

  void main(void)
  {
    vec2 uvs = vTextureCoord.xy;
    vec4 fg = texture2D(uSampler, vTextureCoord);
    gl_FragColor = vec4(fg.r * 1.3, fg.g * 1.3, fg.b * 1.3, fg.a);
  }
`;

const GrayScaleFrag = `
  precision mediump float;

  varying vec2 vTextureCoord;

  uniform sampler2D uSampler;

  void main(void)
  {
    vec4 fg = texture2D(uSampler, vTextureCoord);
    float grey = 0.33 * fg.r + 0.3 * fg.g + 0.37 * fg.b;
    gl_FragColor = vec4(grey, grey, grey, fg.a);
  }
`;

class FiltersClass {
  readonly selected: FilterDefinition = {
    filter: new PIXI.Filter(undefined, OutlineFrag, { outlineColor: new Float32Array([5, 0, 0, 1]) }),
    order: 1
  };
  readonly hover: FilterDefinition = {
    filter: new PIXI.Filter(undefined, HoverFrag),
    order: 2
  };
  readonly greyscale: FilterDefinition = {
    filter: new PIXI.Filter(undefined, GrayScaleFrag),
    order: 3
  };
}

export const Filters = new FiltersClass();
