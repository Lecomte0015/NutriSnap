import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { SPACING } from '../constants/colors';
import { useColors } from '../hooks/useColors';
import { useTranslation } from '../hooks/useTranslation';
import i18n from '../i18n';
import { format } from 'date-fns';
import { fr, de, it, enUS } from 'date-fns/locale';

const { width } = Dimensions.get('window');
const DATE_LOCALES: Record<string, Locale> = { fr, de, it, en: enUS };

interface WeeklyChartProps {
  data: Array<{
    date: string;
    total_calories: number;
  }>;
  goal: number;
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data, goal }) => {
  const COLORS = useColors();
  const t = useTranslation();
  const dateLocale = DATE_LOCALES[i18n.locale] || fr;

  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const chartData = last7Days.map((date) => {
    const dayData = data.find(d => d.date === date);
    const calories = dayData?.total_calories || 0;
    const isOverGoal = calories > goal;

    return {
      value: calories,
      label: format(new Date(date + 'T12:00:00'), 'EEE', { locale: dateLocale }),
      frontColor: isOverGoal ? COLORS.warning : COLORS.secondary,
      topLabelComponent: () => (
        calories > 0 ? (
          <Text style={[styles.topLabel, { color: COLORS.textSecondary }]}>{calories}</Text>
        ) : null
      ),
    };
  });

  const maxValue = Math.max(goal * 1.2, ...chartData.map(d => d.value));

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: COLORS.textPrimary }]}>{t('chart.thisWeek')}</Text>
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
          yAxisTextStyle={{ fontSize: 10, color: COLORS.textLight }}
          xAxisLabelTextStyle={{ fontSize: 11, color: COLORS.textSecondary }}
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
          <Text style={[styles.legendText, { color: COLORS.textSecondary }]}>{t('chart.belowGoal')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.warning }]} />
          <Text style={[styles.legendText, { color: COLORS.textSecondary }]}>{t('chart.aboveGoal')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: COLORS.error }]} />
          <Text style={[styles.legendText, { color: COLORS.textSecondary }]}>{t('chart.goal')} ({goal})</Text>
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
    marginBottom: SPACING.md,
  },
  chartContainer: {
    alignItems: 'center',
  },
  topLabel: {
    fontSize: 10,
    marginBottom: 2,
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
  },
});

export default WeeklyChart;
