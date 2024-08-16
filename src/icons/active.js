import * as React from "react"
import { View, Text } from "react-native"
import Svg, {
  Path,
  G,
  Mask,
  Defs,
  LinearGradient,
  Stop
} from "react-native-svg"

function ActiveIcon({number}) {
  return (
    <View style={{width: 48, height: 48}}>
    <Svg
      width={48}
      height={48}
      viewBox="0 0 48 48"
      fill="none"
    >
      <Path
        d="M10.527 24.7a2.292 2.292 0 012.293-2.292h22.689a2.292 2.292 0 012.292 2.293v13.96c0 .967-.606 1.83-1.515 2.157L24.94 44.906c-.502.181-1.052.181-1.554 0l-11.344-4.087a2.293 2.293 0 01-1.516-2.156V24.7z"
        fill="url(#paint0_linear_1_3)"
      />
      <G opacity={0.4} filter="url(#filter0_f_1_3)">
        <Path
          d="M42.503 22.659c0 9.812-8.211 17.766-18.34 17.766-10.128 0-18.339-7.954-18.339-17.766 0-9.812 8.21-17.766 18.34-17.766 10.128 0 18.339 7.954 18.339 17.766z"
          fill="#321D13"
        />
      </G>
      <Mask
        id="a"
        style={{
          maskType: "alpha"
        }}
        maskUnits="userSpaceOnUse"
        x={5}
        y={2}
        width={38}
        height={37}
      >
        <Path
          d="M42.504 20.643c0 9.812-8.211 17.766-18.34 17.766-10.128 0-18.339-7.954-18.339-17.766 0-9.812 8.21-17.766 18.34-17.766 10.128 0 18.339 7.954 18.339 17.766z"
          fill="#D9D9D9"
        />
      </Mask>
      <G mask="url(#a)">
        <G filter="url(#filter1_d_1_3)">
          <Path
            d="M42.504 20.643c0 9.812-8.211 17.766-18.34 17.766-10.128 0-18.339-7.954-18.339-17.766 0-9.812 8.21-17.766 18.34-17.766 10.128 0 18.339 7.954 18.339 17.766z"
            fill="url(#paint1_linear_1_3)"
          />
        </G>
        <Path
          d="M39.683 20.641c0-8.302-6.947-15.033-15.518-15.033-8.57 0-15.518 6.73-15.518 15.033 0 8.302 6.948 15.033 15.518 15.033s15.518-6.73 15.518-15.033z"
          fill="url(#paint2_linear_1_3)"
        />
        <Path
          d="M37.802 20.642c0 7.296-6.105 13.211-13.637 13.211-7.531 0-13.637-5.915-13.637-13.21 0-7.297 6.106-13.211 13.637-13.211 7.532 0 13.637 5.914 13.637 13.21z"
          fill="url(#paint3_linear_1_3)"
        />
      </G>
      <Defs>
        <LinearGradient
          id="paint0_linear_1_3"
          x1={24.1642}
          y1={22.4082}
          x2={24.1642}
          y2={45.1852}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#D43917" />
          <Stop offset={1} stopColor="#DE5031" />
        </LinearGradient>
        <LinearGradient
          id="paint1_linear_1_3"
          x1={24.1644}
          y1={2.87695}
          x2={24.1644}
          y2={38.4091}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#FFEF98" />
          <Stop offset={0.529832} stopColor="#FBC15B" />
          <Stop offset={1} stopColor="#F49712" />
        </LinearGradient>
        <LinearGradient
          id="paint2_linear_1_3"
          x1={24.1652}
          y1={35.6738}
          x2={24.1652}
          y2={5.60815}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#FFEF98" />
          <Stop offset={0.529832} stopColor="#FBC15B" />
          <Stop offset={1} stopColor="#F49712" />
        </LinearGradient>
        <LinearGradient
          id="paint3_linear_1_3"
          x1={24.1651}
          y1={7.43164}
          x2={24.1651}
          y2={33.853}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#FFEF98" />
          <Stop offset={0.529832} stopColor="#FBC15B" />
          <Stop offset={1} stopColor="#F49712" />
        </LinearGradient>
      </Defs>
    </Svg>
    <Text style={{color: 'rgba(0, 0, 0, 0.80)', position: 'absolute', width: 48, textAlign: 'center', fontFamily: 'Baloo', fontSize: 22,marginTop: 3}}>{number}</Text>
    </View>
  )
}

export default ActiveIcon
