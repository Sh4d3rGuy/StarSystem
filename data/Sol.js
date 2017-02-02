"use strict";

function getSystemData() {

   return {

      stars: [
         {
            name: "Sonne",
            radius: 696342,
            color: {
               r: 1.0,
               g: 0.9,
               b: 0.5
            }

         }

      ],

      planets: [
         {
            name: "Merkur",
            apoapsis: 0.466701,
            periapsis: 0.307498,
            eccentricity: 0.205635934,
            siderealOrbitTime: 87.969,
            orbitInclination: 7.00487,

            siderealRotationTime: 58.646,
            axisInclination: 0.01,

            radius: 2440,
            mass: "3.301 * 10^23 kg"

         },
         {
            name: "Venus",

            apoapsis: 0.728213,
            periapsis: 0.718440,
            eccentricity: 0.006772,
            siderealOrbitTime: 224.701,
            orbitInclination: 3.395,

            siderealRotationTime: 243.025,
            axisInclination: 177.36,

            radius: 2440,
            mass: "3.301 * 10^23 kg"
         },
         {
            name: "Erde",
            orbitColor: 0x6666ff,
            planetColor: 0x6666ff,

            apoapsis: 1.017,
            periapsis: 0.983,
            eccentricity: 0.0167,
            siderealOrbitTime: 365.256,
            orbitInclination: 0,

            siderealRotationTime: 0.9972685,
            axisInclination: 23.44,

            radius: 12756.32 * 0.5,
            mass: "3.301 * 10^23 kg"
         },
         {
            name: "Mars",
            orbitColor: 0xff6666,
            planetColor: 0xff6666,

            apoapsis: 1.666,
            periapsis: 1.381,
            eccentricity: 0.0935,
            siderealOrbitTime: 686.980,
            orbitInclination: 1.85,

            siderealRotationTime: 1.0259491,
            axisInclination: 25.19,

            radius: 6792.4 * 0.5,
            mass: "6,419 * 10^23kg"
         },
         {
            name: "Jupiter",

            apoapsis: 5.46,
            periapsis: 4.95,
            eccentricity: 0.0484,
            siderealOrbitTime: (365.256 * 11) + 315,
            orbitInclination: 1.305,

            siderealRotationTime: 10 / 24, //9h55m30s
            axisInclination: 3.13,

            radius: 142984 * 0.5,
            mass: "1,899 * 10^27 kg"

         },
         {
            name: "Saturn",

            apoapsis: 10.1238,
            periapsis: 9.0412,
            eccentricity: 0.05648,
            siderealOrbitTime: (365.256 * 29.457),
            orbitInclination: 2.484,

            siderealRotationTime: 10.5 / 24, //10 h 33 min
            axisInclination: 26.73,

            radius: 120536 * 0.5,
            mass: "5,685 * 10^26 kg"

         },
         {
            name: "Uranus",

            apoapsis: 20.078,
            periapsis: 18.324,
            eccentricity: 0.0472,
            siderealOrbitTime: (365.256 * 84.011),
            orbitInclination: 0.770,

            siderealRotationTime: 0.718333, //17 h 14 min 24 s
            axisInclination: 97.77,

            radius: 51118 * 0.5,
            mass: "8,683 * 10^25 kg"

         },
         {
            name: "Neptun",

            apoapsis: 30.328,
            periapsis: 29.812,
            eccentricity: 0.00859,
            siderealOrbitTime: (365.256 * 164.79),
            orbitInclination: 1.769,

            siderealRotationTime: 0.6652662, //15 h 57 min 59 s
            axisInclination: 28.32,

            radius: 49528 * 0.5,
            mass: "1,0243 * 10^26 kg"

         }

      ]

   };

}
