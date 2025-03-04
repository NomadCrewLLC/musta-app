import { Text, View, StyleSheet, Switch } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { TimeItemRightAction } from "./TimeItemRightAction";
import { NotificationTimeProps } from "@/helpers/props.helper";

interface Props {
  item: NotificationTimeProps;
  toggleSwitch: Function;
  removeCustomTime: Function;
  editCustomTime: Function;
}

export function TimeItem({
  item,
  toggleSwitch,
  removeCustomTime,
  editCustomTime,
}: Props) {
  const timeItemRightActions = [
    {
      type: "Delete",
      function: removeCustomTime,
    },
    {
      type: "Edit",
      function: editCustomTime,
    },
  ];

  const swipeableContent = (
    <View style={styles.timeItem} key={item.id}>
      <Text style={styles.timeText}>{item.time}</Text>
      <Switch
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={item.isEnabled ? "#007AFF" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={() => toggleSwitch(item.id)}
        value={item.isEnabled}
      />
    </View>
  );

  if (!item.isCustom) {
    return swipeableContent;
  }

  return (
    <>
      <Swipeable
        key={item.id}
        renderRightActions={(progress, dragX) => {
          return timeItemRightActions.map((action) => {
            return (
              <TimeItemRightAction
                key={action.type}
                actionType={action.type}
                id={item.id}
                progress={progress}
                dragX={dragX}
                onPressAction={
                  action.type === "Delete" ? () => removeCustomTime(item.id) : () => editCustomTime(item.id)
                }
              />
            );
          });
        }}
      >
        {swipeableContent}
      </Swipeable>
    </>
  );
}

const styles = StyleSheet.create({
  timeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  timeText: {
    fontSize: 18,
    color: "#000000",
  },
});
