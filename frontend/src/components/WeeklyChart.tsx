import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/colors';

const { width } = Dimensions.get('window');

interface WeeklyChartProps {
  data: Array<{
    date: string;
    total_calories: number;
  }>;
  goal: number;
}

const DAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data, goal }) => {
  // Get last 7 days
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  // Map data to chart format
  const chartData = last7Days.map((date, index) => {
    const dayData = data.find(d => d.date === date);
    const calories = dayData?.total_calories || 0;
    const isOverGoal = calories > goal;
    
    return {
      value: calories,
      label: DAYS_SHORT[(new Date(date).getDay() + 6) % 7], // Adjust for Monday start
      frontColor: isOverGoal ? COLORS.warning : COLORS.secondary,
      topLabelComponent: () => (
        calories > 0 ? (
          <Text style={styles.topLabel}>{calories}</Text>
        ) : null
      ),
    };
  });

  const maxValue = Math.max(goal * 1.2, ...chartData.map(d => d.value));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cette semaine</Text>
      <View style={styles.chartContainer}>
        <BarChart
          data={chartData}
          barWidth={30}
          spacing={12}
          roundedTop
          roundedBottom
          hideRules
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={styles.yAxisText}
          xAxisLabelTextStyle={styles.xAxisText}
          noOfSections={4}
          maxValue={maxValue}
          showReferenceLine1
          referenceLine1Position={goal}
          referenceLine1Config={{
            color: COLORS.error,
            dashWidth: 5,
            dashGap: 3,
          }}
          width={width - 80}
          height={150}
          barBorderRadius={4}
          isAnimated
        />
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.secondary }]} />
          <Text style={styles.legendText}>Sous l'objectif</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.warning }]} />
          <Text style={styles.legendText}>Au-dessus</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: COLORS.error }]} />
          <Text style={styles.legendText}>Objectif ({goal})</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  chartContainer: {
    alignItems: 'center',
  },
  topLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  yAxisText: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  xAxisText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.xs,
  },
  legendLine: {
    width: 15,
    height: 3,
    marginRight: SPACING.xs,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});

export default WeeklyChart;
