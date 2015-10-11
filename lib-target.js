"use strict";

function Target(base, link) {
  $.extend(this, base);
  var self = this;

  if (link) {
    if (!this.is_reflect) {
      this.t += link.delay;
    }
    this.t_final += link.delay;
    this.duration = link.duration;
    this.duration_spd = link.duration_spd;
    this.link = link;
  }
  this.spawn_y = this.is_reflect ? 0 : 0.05;
  this.spawn_t = this.spawn_y * (this.t_final - this.t);
  this.final_y = 'inset_x' in this ? this.INSET_Y : 1;
  this.duration = this.duration || 0;
  this.duration_spd = this.duration_spd || 1;
  this.parent = base;
  console.log(this);

  this.elt = $('<div>').addClass('target')
      .addClass(this.top ? 'p1' : 'p2')
      .on('mousedown touchstart', this.tap.bind(this))
      .on('mouseup touchend mouseleave', this.out.bind(this))
      .on('touchmove', this.move.bind(this))
      .css(this.STYLE)
      .css('opacity', 0)
      .prependTo('#playfield');
  this.color = this.elt.css('background-color');
  if ('inset_x' in this) {
    this.arrow = $('<div>').addClass('arrow').css({
      borderTop: this.RADIUS * 0.8 - 1 + 'px solid transparent',
      borderLeft: this.RADIUS * 1.6 - 4 + 'px solid ' + this.color,
      borderBottom: this.RADIUS * 0.8 - 1 + 'px solid transparent',
      marginLeft: this.RADIUS * 0.4 + 2,
      marginTop: this.RADIUS * 0.2 + 1,
      transformOrigin: (this.RADIUS * 0.6 - 2) + 'px ' +
                       (this.RADIUS * 0.8 - 1) + 'px'
    }).appendTo(this.elt.css('background-color', 'limegreen'));
  }

  var simultaneous = $();
  $.each(alive, function(_, note) {
    $.each(note.targets, function(_, target) {
      if (target.t_final == self.t_final) {
        simultaneous = simultaneous.add(target.elt);
      }
    });
  });
  if (simultaneous.length > 0) {
    simultaneous.add(this.elt).addClass('highlight');
  }

  if (this.v_x == 0) {
    this.lastBounce = this.t;
  } else {
    var final = this.positionAt(this.t_final);
    this.lastBounce = Math.max(this.t, this.t_final -
        (final.v_x > 0 ? final.x : (final.x - 1)) / final.v_x);
  }
}

Target.prototype.RADIUS = 20;
Target.prototype.INSET_Y = 0.75;
Target.prototype.MARGIN = 0.08;
Target.prototype.STYLE = {
  height: 2 * Target.prototype.RADIUS,
  width: 2 * Target.prototype.RADIUS,
  margin: -(Target.prototype.RADIUS + 5)
};

Target.prototype.positionAt = function(now) {
  // math. omg math. let's do some math
  var tStart = this.t + this.spawn_t;
  var tEffective = Math.max(tStart, now);
  var yProgress = this.spawn_y + (this.final_y - this.spawn_y) *
      (tEffective - tStart) / (this.t_final - tStart);
  var y = this.top ? yProgress : (1 - yProgress);
  if (tEffective > this.t_final) {
    var final = this.positionAt(this.t_final);
    var x = final.x + final.v_x * (tEffective - this.t_final);
    var v_x = final.v_x;
  } else {
    var xProgress = ((this.x + this.v_x * (tEffective - this.t)) % 2 + 2) % 2;
    var x = 1 - Math.abs(xProgress - 1);
    var v_x = xProgress < 1 ? this.v_x : -this.v_x;
  }
  return {y: y, x: x, v_x: v_x, yProgress: yProgress};
};

Target.prototype.step = function(now) {
  // this function is black magic; don't worry about it too much
  if (this.flagTap) {
    this.t_tap = now;
    delete this.flagTap;
  }
  if (this.flagOut || now >= this.t_tap + this.duration) {
    this.end(now);
    delete this.flagOut;
  }

  var t_tap = 't_tap' in this ? this.t_tap : now;
  var t_out = 't_out' in this ? this.t_out : now;
  var position = this.positionAt(t_tap + now - t_out);
  var end = position;
  this.elt.css({
    top: 100 * position.y + '%',
    left: 100 * position.x + '%'
  }).toggleClass('clickable',
      this.top && Math.abs(position.y - this.final_y) < this.MARGIN);
  if ('inset_x' in this && position.yProgress < this.INSET_Y) {
    this.arrow.css('transform', 'rotate(' + Math.atan2(
        (this.top ? this.INSET_Y : (1 - this.INSET_Y)) - position.y,
        (this.inset_x + 0.5) / insets - position.x) + 'rad)');
  }

  if ('inset_x' in this && position.yProgress > this.INSET_Y + this.MARGIN) {
    this.opacity = (1 - position.yProgress) / (1 - this.INSET_Y - this.MARGIN);
  } else if (this.is_reflect || now >= this.parent.t + this.spawn_t) {
    this.opacity = 1;
  } else if (this.link) {
    this.opacity = 0;
  } else {
    this.opacity = (now - this.t) / this.spawn_t;
  }
  this.elt.css('opacity', this.opacity);

  if (this.duration) {
    var tail = (t_out - t_tap - this.duration) * this.duration_spd +
        t_tap + now - t_out;
    end = this.positionAt(Math.min(now, Math.max(this.lastBounce, tail)));
    background.duration(this, position, end);
  }

  return Math.abs(end.y - 0.5) < 1;
};

Target.prototype.tap = function(evt) {
  evt.preventDefault();
  if (!('t_tap' in this) && this.elt.hasClass('clickable')) {
    this.flagTap = true;
    this.score = 1; // TODO score varies based on accuracy
    this.elt.css({
      borderWidth: 10,
      margin: -(this.RADIUS + 10)
    });
  }
};

Target.prototype.out = function(evt) {
  evt.preventDefault();
  this.flagOut = true;
};

Target.prototype.move = function(evt) {
  evt.preventDefault();
  var touches = evt.originalEvent.targetTouches;
  var offset = this.offset();
  for (var i = 0; i < touches.length; ++i) {
    if (Math.abs(offset.left - touches[i].clientX) <= this.RADIUS &&
        Math.abs(offset.top - touches[i].clientY) <= this.RADIUS) {
      return;
    }
  }
  this.out(evt);
};

Target.prototype.end = function(now) {
  if ('t_tap' in this && !('t_out' in this)) {
    if (now < this.t_tap + this.duration) {
      this.t_out = now;
    } else {
      this.t_out = this.t_tap + this.duration;
      this.done = true;
      this.elt.animate({
        opacity: 0
      }, {
        progress: function(_, current) {
          $(this).css('transform', 'scale(' + (current / 5 + 1) + ')');
        },
        complete: function() {
          $(this).remove();
        },
        duration: 200
      });
      info.progress(this.top, this.score);
    }
  }
};

Target.prototype.offset = function() {
  var offset = $('#playfield').offset();
  var position = this.elt.position();
  return {
    left: offset.left + position.left,
    top: offset.top + position.top
  };
};
