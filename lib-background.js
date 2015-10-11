"use strict";

function Background() {
  this.canvas = $('#background')[0];
  this.ctx = this.canvas.getContext('2d');
  $(window).resize(this.resize.bind(this)).resize();
}

Background.prototype.resize = function() {
  this.canvas.height = $(window).height();
  this.canvas.width = $(window).width();
  this.ctx.shadowColor = 'white';
  this.ctx.lineCap = 'round';
};

Background.prototype.clear = function() {
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

Background.prototype.link = function(color, targets) {
  this.ctx.lineWidth = 5;
  this.ctx.strokeStyle = color;
  this.ctx.globalAlpha = 1;

  var offset = targets[0].offset();
  this.ctx.beginPath();
  this.ctx.moveTo(offset.left, offset.top);
  for (var i = 1; i < targets.length; ++i) {
    offset = targets[i].offset();
    this.ctx.lineTo(offset.left, offset.top);
  }
  this.ctx.stroke();
};

Background.prototype.duration = function(target, start, end) {
  this.ctx.lineWidth = 2 * (Target.prototype.RADIUS + 5);
  this.ctx.strokeStyle = target.color;
  this.ctx.globalAlpha = Math.max(0, target.opacity) / 2;

  var offset = $('#playfield').offset();
  var width = $('#playfield').width();
  var height = $('#playfield').height();

  this.ctx.beginPath();
  this.ctx.moveTo(start.x * width + offset.left, start.y * height + offset.top);
  this.ctx.lineTo(end.x * width + offset.left, end.y * height + offset.top);
  this.ctx.stroke();
};

Background.prototype.insets = function() {
  for (var i = 0; i < insets; ++i) {
    $.each({
      p1: Target.prototype.INSET_Y,
      p2: 1 - Target.prototype.INSET_Y
    }, function(cls, y) {
      var elt = $('<div>').addClass('target')
          .addClass(cls)
          .css(Target.prototype.STYLE)
          .appendTo('#playfield');
      elt.css({
        top: 100 * y + '%',
        left: 100 * (i + 0.5) / insets + '%',
        backgroundColor: 'transparent',
        boxShadow: 'inset 0 0 1em ' + elt.css('background-color'),
        opacity: 0.5,
        zIndex: -1
      })
    });
  }
};
