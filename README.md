# JSMazeGen

Tile-based procedural dungeon generator written in JS.
Fills a 2D map with a randomly selected number of predefined rooms.
Ported from Ranger Sheck's depth-first search algorithm at http://examples.rangersheck.com/proc_dung_gen/

## Demo

Demo here: http://dl.dropbox.com/u/2741750/mgen/test.html

## Example Usage

```js

	MazeGen.setSize(100,60);
    MazeGen.setRooms([
    [
      [' ',' ',' ',' ','W','+','W','+','W',' '],
      ['W','W','W','W','W','f','f','f','W','W'],
      ['+','f','f','f','f','f','f','f','f','W'],
      ['W','f','f','f','f','f','f','f','f','W'],
      ['W','f','f','f','f','f','f','f','f','W'],
      ['W','f','f','f','f','f','f','f','f','W'],
      ['W','f','f','f','f','f','f','f','f','+'],
      ['W','f','f','f','f','f','f','f','f','W'],
      ['W','f','f','f','f','f','f','f','f','W'],
      ['W','f','f','f','f','f','f','f','f','W'],
      ['W','f','f','f','f','f','f','f','f','+'],
      ['+','f','W','f','f','f','f','f','f','W'],
      ['W','W','W','f','f','f','f','f','W','W'],
      [' ',' ','W','+','W','W','W','+','W',' ']
    ],
    [
      [' ',' ',' ',' ',' ',' ',' ',' ','W','+','W','W','W',' '],
      [' ',' ',' ','W','+','W','W','W','W','f','f','f','W',' '],
      [' ',' ',' ','W','f','f','f','f','f','f','f','f','W','W'],
      [' ',' ',' ','+','f','f','f','f','f','f','f','f','f','+'],
      [' ',' ',' ','W','f','f','f','f','f','f','f','f','W','W'],
      [' ',' ',' ','W','f','f','f','f','f','f','f','f','W',' '],
      [' ',' ',' ','W','W','f','f','f','f','f','f','f','W','W'],
      [' ',' ',' ',' ','W','f','f','f','f','f','f','f','f','W'],
      [' ',' ',' ','W','W','f','f','f','f','f','f','f','f','+'],
      [' ',' ',' ','W','f','f','f','f','f','f','f','f','f','W'],
      ['W','W','+','W','f','f','f','f','f','f','f','f','W','W'],
      ['+','f','f','f','f','f','f','f','f','f','f','f','W',' '],
      ['W','W','W','f','f','f','f','f','f','f','f','f','W','W'],
      [' ',' ','W','W','f','f','f','f','f','f','f','f','f','W'],
      [' ',' ',' ','+','f','f','f','f','f','f','f','f','f','+'],
      [' ',' ',' ','W','W','+','W','W','W','f','f','f','W','W'],
      [' ',' ',' ',' ',' ',' ',' ',' ','W','W','+','W','W',' ']
    ]]); // etc

    MazeGen.generate();
    $('#map').append(MazeGen.toHTML());
```