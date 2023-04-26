# JavaScript Raycasting Test Engine

Hi, I'm luife and I've created a small raycasting engine.

Try it in PC: https://luifegames.github.io/raycastingengine.github.io/

## Controls

Mouse and `wasd` to move.

## Techniques

This is a technique used in computer graphics to render 3D images in real time, and is the basis for many famous video games, such as Doom, Wolfenstein 3D, and Duke Nukem 3D. In the following, I will describe how the raycasting engine works step by step and give some examples of popular video games that use it.

1. Define a map: The first step in using the raycasting engine is to define a map. The map can be an array of numbers that specify the type of texture for each sector, or it can be an image that is used to obtain information about the walls and the floor.

2. Define the player's position and direction: The second step is to define the player's position and direction on the map. The player will move forward or backward in the direction that he is pointing.

3. Ray Tracing: The raycasting engine traces rays from the player's position to the edges of the field of view. The number of rays that are traced determines the resolution of the final image.

4. Detect Wall Intersections: When lightning intersects a wall, this information is used to calculate the distance from the player's position to the wall. The distance is then used to calculate the height on the screen corresponding to the wall.

5. Paint on screen: After calculating the height of the wall, that line of pixels is painted with the color of the wall texture. Raytracing is then continued for the next lines of pixels, and the process of intersecting with the walls is performed again.

The raycasting engine is so optimal because it only needs to traverse the sectors or walls that are in the player's line of sight and no computation is needed in the areas that are obstructed. This makes the raycasting engine much more efficient than the full ray tracing method.

Some very popular video games that use the raycasting engine include:

1. Wolfenstein 3D: This is one of the first video games to use the raycasting engine. It was released in 1992, and it became a hit due to its exciting game mechanics and realistic 3D rendering.

2. Doom: It is a first-person shooter video game released in 1993. Doom, also developed by id Software, was another great success thanks to its improved raycasting engine, as well as fast action and fun weapons.

3. Duke Nukem 3D: Released in 1996, it's another great example of first-person shooters using the raycasting engine. Duke Nukem 3D was very successful due to its incredible graphic detail and comic style.
