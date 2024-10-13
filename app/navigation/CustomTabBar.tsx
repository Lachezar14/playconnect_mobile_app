import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomTabBar = ({
                          state,
                          descriptors,
                          navigation,
                          tabBarHeight,
                          iconSize,
                          activeColor,
                          inactiveColor,
                          topSpacing,
                          bottomSpacing,
                          backgroundColor
                      }) => {
    const focusedOptions = descriptors[state.routes[state.index].key].options;
    if (focusedOptions.tabBarStyle && focusedOptions.tabBarStyle.display === 'none') {
        return null;
    }

    return (
        <View style={[
            styles.tabBar,
            {
                height: tabBarHeight,
                backgroundColor: backgroundColor,
                paddingTop: topSpacing,
                paddingBottom: bottomSpacing,
                borderTopColor: 'white'
            }
        ]}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label = options.tabBarLabel !== undefined
                    ? options.tabBarLabel
                    : options.title !== undefined
                        ? options.title
                        : route.name;

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <TouchableOpacity
                        key={index}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        style={styles.tabItem}
                    >
                        {options.tabBarIcon({
                            color: isFocused ? activeColor : inactiveColor,
                            size: iconSize
                        })}
                        <Text style={{
                            color: isFocused ? activeColor : inactiveColor,
                            fontSize: 12,
                            marginTop: 4
                        }}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    tabItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CustomTabBar;