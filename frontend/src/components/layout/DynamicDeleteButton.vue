<template>
  <div
class="dynamic-delete-button"
:class="{ highlighted, active, removing }"
@click.stop.prevent.capture
    @mouseover.stop.prevent.capture
@mouseenter.stop="highlight"
@mouseleave.stop="cancel"
@mousecancel.stop="cancel"
    @mousedown.stop="activate"
@mouseup.stop="executeOrCancel"
@mousemove="updateTrashPosition"
@touchcancel="cancel"
    @touchend="executeOrCancel"
@touchmove="updateTrashPosition"
@touchstart="activate"
>
    <div
ref="track"
class="track"
>
      <DeleteEmpty
v-if="removingPossible && !removing"
class="icon empty-bin-icon"
:size="iconSize"
/>
      <Delete
v-else
class="icon bin-icon"
:size="iconSize"
/>

      <span class="text">LÖSCHEN</span>

      <div
ref="trashTrack"
class="trash-track"
>
        <div
ref="trash"
class="trash"
:class="{ hidden: !removingPossible }"
/>
      </div>
    </div>
  </div>
</template>

<script>
import Delete from 'vue-material-design-icons/Delete';
import DeleteEmpty from 'vue-material-design-icons/DeleteEmpty';

export default {
  components: {
    DeleteEmpty,
    Delete,
  },
  props: {
    time: {
      type: Number,
      default: 1500,
    },
  },
  data: function () {
    return {
      active: false,
      highlighted: false,
      removing: false,
      activationTimeout: null,
      removingPossible: false,
      iconSize: 20
    };
  },
  methods: {
    requestRemove: function () {
      if (this.active) {
        this.$emit('delete');
        this.active = false;
        this.reset();
      }
    },
    executeOrCancel() {
      if (this.removing) {
        this.requestRemove();
      } else {
        this.cancel();
      }
    },
    updateTrashPosition(event) {
      if (this.active) {
        const trashTrack = this.$refs.trashTrack;
        const trackRect = trashTrack.getBoundingClientRect();
        const trash = this.$refs.trash;

        const position = event.touches ? event.touches[0] : event;
        const positionX = Math.max(0, trackRect.right - position.x)
        trash.style.right = `${positionX}px`;

        if (this.removingPossible && trackRect.width > 50) {
          this.removing = position.x - trackRect.left < 15;
        }
      }
    },
    resetTrashPosition() {
      this.$refs.trash.style.right = '0px';
    },
    highlight() {
      this.highlighted = true;
    },
    activate(event) {
      event.stopPropagation();
      event.preventDefault();

      this.active = true;

      if (this.activationTimeout) {
        this.removingPossible = false;
        clearTimeout(this.activationTimeout);
      }

      this.activationTimeout = setTimeout(
        () => (this.removingPossible = true),
        200
      );

      this.$emit('open');
    },
    reset() {
      this.active = false;
      this.highlighted = false;
      this.removing = false;
      this.removingPossible = false;
      this.resetTrashPosition();
    },
    cancel() {
      this.reset();
      this.$emit('cancel');
    },
  },
};
</script>

<style lang="scss" scoped>
$size: 30px;
$trash-size: 10px;
$track-color: $dark-white;

svg {
  fill: currentColor;
}

.dynamic-delete-button {
  margin: 3px;
  position: relative;
  width: $size;
  height: $size;
  cursor: pointer;
}

.text {
  font-size: $small-font;
  position: absolute;
  opacity: 0;
  top: 50%;
  left: calc(50% + 10px);
  transform: translate(-50%, -50%);
  font-weight: bold;
  text-transform: uppercase;
  transition: all $transition-time;
}

.track {
  position: absolute;
  right: 0;
  top: 50%;
  z-index: 1;

  overflow: hidden;
  transform: translate(0, -50%);

  width: $size;
  height: $size;
  border-radius: $border-radius;
  box-shadow: $shadow;
  background-color: $track-color;

  transition: all $transition-time;
}

.icon {
  position: absolute;
  top: 5px;
  left: 5px;
}

.highlighted {
  color: $red;

  .track {
    background-color: color.adjust($color: $track-color, $lightness: -5%);
  }
}

.trash-track {
  opacity: 1;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);

  right: math.div($size, 2);
  left: math.div($size, 2);
  height: $trash-size;
  border-radius: math.div($trash-size, 2);
}

.trash {
  position: absolute;
  right: 0;
  width: $trash-size;
  height: $trash-size;
  border-radius: math.div($trash-size, 2);
  background-color: $red;
  transform: translateX(50%) scale(1);
  opacity: 1;

  transition: right 0.1s, transform $transition-time,
    background-color $transition-time, opacity $transition-time;
}

.hidden {
  opacity: 0;
}

.active {
  .track {
    width: 130px;
    background-color: $track-color;
  }

  .text {
    opacity: 1;
    color: currentColor;
  }
}

.removing {
  .track {
    background-color: $red;
    color: white;
  }

  .text {
    color: white;
  }

  .trash {
    background-color: transparent;
    transform: scale(0);
  }
}

.empty-bin-icon {
  transform: scaleX(-1);
}
</style>