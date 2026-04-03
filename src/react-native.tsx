"use client";

import { useMemo, useRef, useState } from "react";
import type { GestureResponderEvent, PanResponderGestureState } from "react-native";
import { Animated, PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useDevLensActions, useDevLensSnapshot } from "./core/context";
import type { DevLensEntry } from "./core/types";
import { formatTime, summarizeEntry } from "./components/common";

function detailText(entry: DevLensEntry) {
  return JSON.stringify(entry, null, 2);
}

export function DevLensPanel() {
  const { entries, counts } = useDevLensSnapshot();
  const { clear } = useDevLensActions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => entries.find((item) => item.id === selectedId) ?? entries[0], [entries, selectedId]);

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>DevLens</Text>
          <Text style={styles.subtitle}>
            {counts.network} network · {counts.log} logs · {counts.error} errors
          </Text>
        </View>
        <Pressable onPress={clear} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </Pressable>
      </View>
      <View style={styles.body}>
        <ScrollView style={styles.list}>
          {entries.map((entry) => (
            <Pressable
              key={entry.id}
              onPress={() => setSelectedId(entry.id)}
              style={[styles.item, selected?.id === entry.id && styles.itemActive]}
            >
              <Text style={styles.itemMeta}>
                {entry.kind.toUpperCase()} · {formatTime(entry.timestamp)}
              </Text>
              <Text style={styles.itemText}>{summarizeEntry(entry)}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <ScrollView style={styles.detailPane}>
          <Text style={styles.detailText}>{selected ? detailText(selected) : "No events yet."}</Text>
        </ScrollView>
      </View>
    </View>
  );
}

export function DevLensFloatingButton() {
  const [open, setOpen] = useState(false);
  const drag = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const offset = useRef({ x: 0, y: 0 });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          drag.setOffset(offset.current);
          drag.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: Animated.event([null, { dx: drag.x, dy: drag.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_event: GestureResponderEvent, gesture: PanResponderGestureState) => {
          offset.current = {
            x: offset.current.x + gesture.dx,
            y: offset.current.y + gesture.dy,
          };
          drag.flattenOffset();
        },
      }),
    [drag],
  );

  return (
    <>
      {open ? (
        <View pointerEvents="box-none" style={styles.overlay}>
          <View style={styles.sheet}>
            <DevLensPanel />
            <Pressable onPress={() => setOpen(false)} style={styles.closeSheetButton}>
              <Text style={styles.closeSheetButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
      <Animated.View
        style={[
          styles.floatingWrap,
          {
            transform: drag.getTranslateTransform(),
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Pressable onPress={() => setOpen((value) => !value)} style={styles.floatingButton}>
          <Text style={styles.floatingButtonText}>DL</Text>
        </Pressable>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    minHeight: 420,
    backgroundColor: "#020617",
    borderRadius: 24,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  title: {
    color: "#f8fafc",
    fontWeight: "700",
    fontSize: 20,
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: 4,
  },
  clearButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  clearButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  body: {
    flex: 1,
    flexDirection: "row",
  },
  list: {
    width: 320,
    borderRightWidth: 1,
    borderRightColor: "#1e293b",
  },
  item: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#0f172a",
  },
  itemActive: {
    backgroundColor: "#172554",
  },
  itemMeta: {
    color: "#94a3b8",
    fontSize: 11,
    marginBottom: 6,
  },
  itemText: {
    color: "#e2e8f0",
    fontSize: 12,
    lineHeight: 18,
  },
  detailPane: {
    flex: 1,
    padding: 14,
  },
  detailText: {
    color: "#e2e8f0",
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 18,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    backgroundColor: "rgba(2, 6, 23, 0.55)",
    zIndex: 99998,
  },
  sheet: {
    maxHeight: "82%",
    margin: 12,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#020617",
  },
  closeSheetButton: {
    padding: 14,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    backgroundColor: "#0f172a",
  },
  closeSheetButtonText: {
    color: "#f8fafc",
    fontWeight: "600",
  },
  floatingWrap: {
    position: "absolute",
    right: 20,
    bottom: 20,
    zIndex: 99999,
  },
  floatingButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 18,
    elevation: 10,
  },
  floatingButtonText: {
    color: "#ffffff",
    fontWeight: "800",
  },
});
