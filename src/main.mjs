import './game-core.mjs?v336';

const game = globalThis.__PIXELVIVOR__;
if (game) {
  const keys = game.keys ?? Object.create(null);
  game.keys = keys;
  game.input = game.input ?? {
    keys,
    _bound: false,
    bind() {
      const onKeyDown = (event) => {
        const key = event.key?.toLowerCase?.();
        if (key) keys[key] = true;
      };
      const onKeyUp = (event) => {
        const key = event.key?.toLowerCase?.();
        if (key) keys[key] = false;
      };
      addEventListener('keydown', onKeyDown);
      addEventListener('keyup', onKeyUp);
      return { onKeyDown, onKeyUp };
    },
    isPressed(key) {
      return Boolean(keys[String(key).toLowerCase()]);
    }
  };
  if (!game.input._bound) {
    game.input.bind();
    game.input._bound = true;
  }
}
