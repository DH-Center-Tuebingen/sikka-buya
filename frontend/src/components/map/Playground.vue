<template>
  <div></div>
</template>

<script>
import MapMixin from './mixins/map';
import { concentricCircles } from '../../maps/graphics/ConcentricCircles';

import LatLon from 'geodesy/latlon-spherical.js';

export default {
  mixins: [MapMixin],
  mounted() {

    setTimeout(() => {

      createPairOfPoints.call(this, {
        circleCenter: [33.20192, 57.16187],
        circleRadius: 50000,
        targetPosition: [32.26857, 52.86036],
        targetRadius: 10,
      })

      createPairOfPoints.call(this, {
        circleCenter: [29.43586, 52.68268],
        circleRadius: 50000,
        targetPosition: [32.26857, 52.86036],
        targetRadius: 10,
      })

      createPairOfPoints.call(this, {
        circleCenter: [33.86439, 48.84065],
        circleRadius: 50000,
        targetPosition: [32.26857, 52.86036],
        targetRadius: 10,
      })

      function createPairOfPoints({
        circleCenter = [33.20192, 57.16187],
        circleRadius = 50000,
        targetPosition = [32.26857, 52.86036],
        targetRadius = 10,
      } = {}) {

        const circle = this.L.circle(circleCenter, {
          color: 'red',
          radius: circleRadius
        }).addTo(this.map);





        const target = this.L.circleMarker(targetPosition, {
          color: 'blue',
          fillOpacity: .1,
          radius: targetRadius
        }).addTo(this.map);


        // Draw line between Marker and Center of Circle in coordinate space
        this.L.polyline([circleCenter, targetPosition], {
          color: 'green',
          weight: 1,
          dashArray: '5, 5'
        }).addTo(this.map);

        // Convert Leaflet LatLng points to geodesy LatLng points
        let pointA = new LatLon(targetPosition[0], targetPosition[1]);
        let pointB = new LatLon(circleCenter[0], circleCenter[1]);

        // Get the bearing from point b to point a
        let bearing = pointB.initialBearingTo(pointA);

        // Move point b 500 meters towards point a
        let newPointB = pointB.destinationPoint(circleRadius, bearing);

        // Convert the new geodesy LatLng point back to a Leaflet LatLng point
        let positionOnCircle = this.L.latLng(newPointB.lat, newPointB.lon);


        //============================
        //============================

        // Now we calculate the intersection point of the line with the circle marker

        function createLine() {
          const radius = target._radius
          const vector = [target._point.x - circle._point.x, target._point.y - circle._point.y]
          const normalizedVector = vector.map(a => a / Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]))
          console.log(target._point.x, normalizedVector[0], radius)

          let targetIntersectionPoint = [target._point.x - normalizedVector[0] * radius, target._point.y - normalizedVector[1] * radius]
          console.log(targetIntersectionPoint)
          const intersectionLocation = this.map.layerPointToLatLng(targetIntersectionPoint)
          console.log(intersectionLocation)
          return this.L.polyline([intersectionLocation, positionOnCircle], {
            color: 'yellow',
            weight: 2,
          }).addTo(this.map);
        }

        let line = null
        createLine.call(this)
        this.map.on("zoomend", () => {
          console.log(this.map.getZoom())
          if (line)
            line.remove()

          line = createLine.call(this)
        })
      }



    }, 10);
  },
};
</script>