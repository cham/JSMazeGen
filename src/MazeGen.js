define(function(){
  'use strict';

  return {
    map: [],
    rooms: [],
    width: 0,
    height: 0,
    startCoords: null,
    goalCoords: null,
    reverseGoal: false,

    setSize: function(w,h){
      this.width = w;
      this.height = h;
    },

    setRooms: function(r){
      var highest = 0;
      this.rooms = r;
      this.widestRoom = _(this.rooms).reduce(function(memo,room){
        _(room).each(function(rows){
          if(rows.length>highest){ highest = rows.length; }
        });
        memo = highest;
        return memo;
      },0);
      this.tallestRoom = _(this.rooms).reduce(function(memo,room){
        if(room.length>memo){ memo = room.length; }
        return memo;
      },0);
    },

    pickRoom: function(){
      return this.rooms[(this.rooms.length * Math.random()) | 0];
    },

    makeBlankMap: function(){
      var numRows = this.height,
        numCols = this.width,
        arr = [], row = [], i, j;

      for(i=0;i<numRows;i++){
        row = [];
        for(j=0;j<numCols;j++){
          row.push(' ');
        }
        arr.push(row);
      }

      return arr;
    },

    north: function(coords){
      if(!this.map[coords.y-1] || !this.map[coords.y-1][coords.x]){
        return 'U';
      }
      return this.map[coords.y-1][coords.x];
    },

    south: function(coords){
      if(!this.map[coords.y+1] || !this.map[coords.y+1][coords.x]){
        return 'U';
      }
      return this.map[coords.y+1][coords.x];
    },

    west: function(coords){
      if(!this.map[coords.y] || !this.map[coords.y][coords.x-1]){
        return 'U';
      }
      return this.map[coords.y][coords.x-1];
    },

    east: function(coords){
      if(!this.map[coords.y] || !this.map[coords.y][coords.x+1]){
        return 'U';
      }
      return this.map[coords.y][coords.x+1];
    },

    emptyNeighbor: function(x,y) {
      if(this.north({x:x,y:y}) === ' ') return [x,   y-1];
      if(this.south({x:x,y:y}) === ' ') return [x,   y+1];
      if(this.west({x:x,y:y})  === ' ') return [x-1, y  ];
      if(this.east({x:x,y:y})  === ' ') return [x+1, y  ];
      return false;
    },

    isClearRect: function(from, to) {
        var startX = _([from.x,to.x]).min(),
          endX = _([from.x,to.x]).max(),
          startY = _([from.y,to.y]).min(),
          endY = _([from.y,to.y]).max();

        for(var y=startY; y <= endY; y++) {
          for(var x=startX; x <= endX; x++) {
            if(this.map[y][x] !== ' ' && this.map[y][x] !== '+') return false;
          }
        }
        return true;
    },

    drawCorridor: function(from, to) {
      var x1 = from.x, x2 = to.x,
        y1 = from.y, y2 = to.y,
        h_mod, v_mod, x, y;
        h_mod = x1 < x2 ? 1 : -1;
        v_mod = y1 < y2 ? 1 : -1;
        x = x1;
        y = y1;

      while( x !== x2 || y !== y2) {
        this.map[y][x] = 'f'
        if(x != x2 && Math.random() > 0.5) {
          x += h_mod;
        } else if(y != y2) {
          y += v_mod;
        }
      }
      this.map[y][x] = 'f'
    },

    drawCorridors: function(exitList){
      var curRoom,
          madeCorridor = false,
          self = this,
          exits = _(exitList).clone(),
          linkedExits = _(exitList).reduce(function(memo,val,i){
            memo.push({exit:val.exit,used:false});
            return memo;
          },[]);

      _(exits).each(function(exit,i){
        curRoom = exit.exit.roomnum;
        exits = _(exits).without(exit);
        madeCorridor = false;

        _(exits).chain().shuffle().each(function(otherExit,j){

          if(otherExit.exit.roomnum===curRoom){
            return;
          }

          var from = {x: exit.empty[0], y: exit.empty[1]},
              to = {x: otherExit.empty[0], y: otherExit.empty[1]};

          if(self.isClearRect(from,to)){
            madeCorridor = true;
            self.drawCorridor(from,to);
            linkedExits[exit.exit.id] = {exit:exit.exit,used:true};
            linkedExits[otherExit.exit.id] = {exit:otherExit.exit,used:true};
            if(self.reverseGoal || !self.startCoords){
              self.startCoords = from;
            }
          }
        });

      });
      _(linkedExits).each(function(exit,i){
        if(!exit.used){
          self.removeDoor({x: exit.exit.coords.x, y: exit.exit.coords.y });
        }
      });
    },

    drawCorridorWalls: function(){
      var self = this;
      _(this.map).each(function(row,y){
        _(row).each(function(tile,x){
          if(tile === 'f') {
            if(self.north({x:x,y:y}) === ' ')     self.map[y-1][x  ]   = 'W';
            if(self.south({x:x,y:y}) === ' ')     self.map[y+1][x  ]   = 'W';
            if(self.west({x:x,y:y}) === ' ')      self.map[y  ][x-1]   = 'W';
            if(self.east({x:x,y:y}) === ' ')      self.map[y  ][x+1]   = 'W';
          } else if(tile === '+') {
            self.map[y][x] = 'f';
          }
        });
      });
    },

    getWalkableMap: function(){
      return _(this.map).map(function(row){
        return _(row).map(function(tile){
          return tile === 'f' ? 'w' : 'u';
        });
      });
    },

    getStartCoords: function(){
      return this.startCoords;
    },

    getGoalCoords: function(){
      if(this.reverseGoal){
        return this.lastWalkableTile();
      }else{
        return this.firstWalkableTile();
      }
    },

    removeDoor: function(coords){
      var n = this.north(coords),
          s = this.south(coords),
          w = this.west(coords),
          e = this.east(coords),
          numWalkableNeighbors = 0,
          isWalkable = function(t){
            return t==='f';
          };
      
      _([n,s,w,e]).each(function(tile){
        if(isWalkable(tile)){numWalkableNeighbors++;}
      });
      if(numWalkableNeighbors>1){
        return;
      }
      this.map[coords.y][coords.x] = 'W';
    },

    toHTML: function(){
      //return $.map(this.coded_coords,
      return _(this.map).map(function(cc){
        return _(cc).map(function(c){
          return '<div class="t ' + (c === 'W' || c === 'f' ? c : '') + '"></div>';
        }).join('');
      }).join('<br/>');
    },

    lastWalkableTile: function(){
      var coords = {x:0,y:0};
      _(this.map).each(function(row,i){
        var ind = _(row).indexOf('f');
        if(ind===-1){
          return false;
        }
        coords.x = ind;
        coords.y = i;
        return true;
      });
      return coords;
    },

    firstWalkableTile: function(){
      var coords = {x:0,y:0};
      _(this.map).find(function(row,i){
        var ind = _(row).lastIndexOf('f');
        if(ind===-1){
          return false;
        }
        coords.x = ind;
        coords.y = i;
        return true;
      });
      return coords;
    },

    generate: function(){
      var len = ((this.height-1) / this.tallestRoom) | 0, // len is the number of times the tallest room can fit in
        roomsPerRow = ((this.width-1) / this.widestRoom) | 0,
        roomsThisRow = 0,
        room,
        x,y,baseY,roomY,
        head, tail,
        map = this.makeBlankMap(), maprow = [], exits = [], usableExits = [], empty = null,
        padX = (((this.width - (roomsPerRow * this.widestRoom)) / roomsPerRow) | 0),
        padY = (((this.height - (len * this.tallestRoom)) / len) | 0) + 1,
        self = this,
        roomchancePer = ((100 / (roomsPerRow * len)) | 0)*0.02,
        roomchance = 1,
        numrooms = 0,
        exitCount = 0;

      this.startCoords = null;
      
      // from the bottom of the map backwards, place a room and move up to next block
      // populate exits array as we go
      while(len--){
        baseY = (len * this.tallestRoom);
        roomsThisRow = roomsPerRow;
        while(roomsThisRow--){
          roomchance+=roomchancePer;
          if(Math.random() < roomchance){
            roomchance = roomchancePer;
            numrooms++;
            x = (roomsThisRow * this.widestRoom) + (padX * roomsThisRow+1) | 0;
            roomY = baseY + ((Math.random()*(padY-1)) | 0);
            room = this.pickRoom();
            _(room).each(function(row,i){
              y = roomY+i;
              if(!map[y]){return;}
              head = map[y].slice(0,x);
              tail = map[y].slice(x+row.length);
              map[y] = head.concat(row);
              map[y] = map[y].concat(tail);

              exits = exits.concat(
                _(row).reduce(function(memo,item,j){
                  if(item==='+'){
                    memo.push({coords:{y:y,x:j+x},roomnum:numrooms,id:exitCount});
                    exitCount++;
                  }
                  return memo;
                },[])
              );
            });
          }
        }
      }
      this.map = map;

      _(exits).each(function(exit){
        empty = self.emptyNeighbor(exit.coords.x,exit.coords.y);
        if(empty){
          usableExits.push({exit:exit,empty:empty});
        }else{
          self.map[exit.coords.y][exit.coords.x] = 'W';
        }
      });

      this.drawCorridors(usableExits);
      this.drawCorridorWalls();

    }
  };

});