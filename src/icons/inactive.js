import * as React from "react"
import { View, Text } from "react-native"
import Svg, {
  Path,
  G,
  Ellipse,
  Mask,
  Defs,
  LinearGradient,
  Stop
} from "react-native-svg"
/* SVGR has dropped some elements not supported by react-native-svg: filter */

function InactiveIcon({ number }) {
  return (
    <View style={{width: 48, height: 48}}>
    <Svg
      width={48}
      height={48}
      viewBox="0 0 48 48"
      fill="none"
    >
      <Path
        d="M10.527 24.2a2.292 2.292 0 012.293-2.292h22.689a2.292 2.292 0 012.292 2.293v13.96c0 .967-.606 1.83-1.515 2.157L24.94 44.406c-.502.181-1.052.181-1.554 0l-11.344-4.087a2.293 2.293 0 01-1.516-2.156V24.2z"
        fill="url(#paint0_linear_4_14)"
      />
      <G opacity={0.4} filter="url(#filter0_f_4_14)">
        <Ellipse
          cx={24.1634}
          cy={22.1587}
          rx={18.3392}
          ry={17.7661}
          fill="#1F1F1F"
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
        height={36}
      >
        <Ellipse
          cx={24.1644}
          cy={20.143}
          rx={18.3392}
          ry={17.7661}
          fill="#D9D9D9"
        />
      </Mask>
      <G mask="url(#a)">
        <G filter="url(#filter1_d_4_14)">
          <Ellipse
            cx={24.1644}
            cy={20.143}
            rx={18.3392}
            ry={17.7661}
            fill="url(#paint1_linear_4_14)"
          />
          <Ellipse
            cx={24.1644}
            cy={20.143}
            rx={18.3392}
            ry={17.7661}
            fill="url(#paint2_linear_4_14)"
          />
        </G>
        <Ellipse
          cx={15.5178}
          cy={15.0328}
          rx={15.5178}
          ry={15.0328}
          transform="matrix(1 0 0 -1 8.647 35.174)"
          fill="url(#paint3_linear_4_14)"
        />
        <Ellipse
          cx={15.5178}
          cy={15.0328}
          rx={15.5178}
          ry={15.0328}
          transform="matrix(1 0 0 -1 8.647 35.174)"
          fill="url(#paint4_linear_4_14)"
        />
        <Path
          d="M37.802 20.142c0 7.296-6.105 13.211-13.637 13.211-7.531 0-13.637-5.915-13.637-13.21 0-7.297 6.106-13.211 13.637-13.211 7.532 0 13.637 5.914 13.637 13.21z"
          fill="url(#paint5_linear_4_14)"
        />
      </G>
      <Defs>
        <LinearGradient
          id="paint0_linear_4_14"
          x1={24.1642}
          y1={21.9082}
          x2={24.1642}
          y2={44.6852}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#737986" />
          <Stop offset={0.529832} stopColor="#363D4D" />
          <Stop offset={1} stopColor="#3C414D" />
        </LinearGradient>
        <LinearGradient
          id="paint1_linear_4_14"
          x1={24.1644}
          y1={2.37695}
          x2={24.1644}
          y2={37.9091}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#FFEF98" />
          <Stop offset={0.529832} stopColor="#FBC15B" />
          <Stop offset={1} stopColor="#F49712" />
        </LinearGradient>
        <LinearGradient
          id="paint2_linear_4_14"
          x1={24.1644}
          y1={2.37695}
          x2={24.1644}
          y2={37.9091}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#737986" />
          <Stop offset={0.529832} stopColor="#434851" />
          <Stop offset={1} stopColor="#1C1F26" />
        </LinearGradient>
        <LinearGradient
          id="paint3_linear_4_14"
          x1={15.5178}
          y1={0}
          x2={15.5178}
          y2={30.0657}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#FFEF98" />
          <Stop offset={0.529832} stopColor="#FBC15B" />
          <Stop offset={1} stopColor="#F49712" />
        </LinearGradient>
        <LinearGradient
          id="paint4_linear_4_14"
          x1={15.5178}
          y1={0}
          x2={15.5178}
          y2={30.0657}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#737986" />
          <Stop offset={0.529832} stopColor="#434851" />
          <Stop offset={1} stopColor="#1C1F26" />
        </LinearGradient>
        <LinearGradient
          id="paint5_linear_4_14"
          x1={24.1651}
          y1={6.93164}
          x2={24.1651}
          y2={33.353}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#737986" />
          <Stop offset={0.529832} stopColor="#434851" />
          <Stop offset={1} stopColor="#1C1F26" />
        </LinearGradient>
      </Defs>
    </Svg>
    <Text style={{color: 'rgba(255, 255, 255, 0.40)', position: 'absolute', width: 48, textAlign: 'center', fontFamily: 'Baloo', fontSize: 22,marginTop: 3}}>{number}</Text>
    </View>
  )
}

export default InactiveIcon
