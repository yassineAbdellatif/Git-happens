import { SHUTTLE_SCHEDULE } from '../app/frontend/src/constants/shuttleSchedule';

describe('shuttleSchedule constants', () => {
  describe('SHUTTLE_SCHEDULE', () => {
    it('should be defined', () => {
      expect(SHUTTLE_SCHEDULE).toBeDefined();
    });

    it('should have activeSemester property', () => {
      expect(SHUTTLE_SCHEDULE).toHaveProperty('activeSemester');
      expect(typeof SHUTTLE_SCHEDULE.activeSemester).toBe('string');
    });

    it('should have semesters object', () => {
      expect(SHUTTLE_SCHEDULE).toHaveProperty('semesters');
      expect(typeof SHUTTLE_SCHEDULE.semesters).toBe('object');
    });

    it('should have active semester in semesters object', () => {
      const activeSemester = SHUTTLE_SCHEDULE.activeSemester;
      expect(SHUTTLE_SCHEDULE.semesters).toHaveProperty(activeSemester);
    });

    describe('Winter 2026 Schedule', () => {
      const winterSchedule = SHUTTLE_SCHEDULE.semesters['Winter 2026'];

      it('should have Schedule property', () => {
        expect(winterSchedule).toHaveProperty('Schedule');
      });

      it('should have Monday-Thursday schedule', () => {
        expect(winterSchedule.Schedule).toHaveProperty('Monday-Thursday');
      });

      it('should have Friday schedule', () => {
        expect(winterSchedule.Schedule).toHaveProperty('Friday');
      });

      describe('Monday-Thursday Schedule', () => {
        const mondayThursday = winterSchedule.Schedule['Monday-Thursday'];

        it('should have correct days array', () => {
          expect(mondayThursday.days).toEqual([1, 2, 3, 4]);
        });

        it('should have departure times for LOY', () => {
          expect(mondayThursday).toHaveProperty('departure_times_LOY');
          expect(Array.isArray(mondayThursday.departure_times_LOY)).toBe(true);
          expect(mondayThursday.departure_times_LOY.length).toBeGreaterThan(0);
        });

        it('should have departure times for SGW', () => {
          expect(mondayThursday).toHaveProperty('departure_times_SGW');
          expect(Array.isArray(mondayThursday.departure_times_SGW)).toBe(true);
          expect(mondayThursday.departure_times_SGW.length).toBeGreaterThan(0);
        });

        it('should have valid time format for LOY times', () => {
          const timeRegex = /^\d{1,2}:\d{2}$/;
          mondayThursday.departure_times_LOY.forEach(time => {
            expect(time).toMatch(timeRegex);
          });
        });

        it('should have valid time format for SGW times', () => {
          const timeRegex = /^\d{1,2}:\d{2}$/;
          mondayThursday.departure_times_SGW.forEach(time => {
            expect(time).toMatch(timeRegex);
          });
        });

        it('should have times in chronological order for LOY', () => {
          const times = mondayThursday.departure_times_LOY;
          for (let i = 1; i < times.length; i++) {
            const prev = times[i - 1].split(':').map(Number);
            const curr = times[i].split(':').map(Number);
            const prevMinutes = prev[0] * 60 + prev[1];
            const currMinutes = curr[0] * 60 + curr[1];
            expect(currMinutes).toBeGreaterThanOrEqual(prevMinutes);
          }
        });

        it('should have times in chronological order for SGW', () => {
          const times = mondayThursday.departure_times_SGW;
          for (let i = 1; i < times.length; i++) {
            const prev = times[i - 1].split(':').map(Number);
            const curr = times[i].split(':').map(Number);
            const prevMinutes = prev[0] * 60 + prev[1];
            const currMinutes = curr[0] * 60 + curr[1];
            expect(currMinutes).toBeGreaterThanOrEqual(prevMinutes);
          }
        });
      });

      describe('Friday Schedule', () => {
        const friday = winterSchedule.Schedule['Friday'];

        it('should have correct days array', () => {
          expect(friday.days).toEqual([5]);
        });

        it('should have departure times for LOY', () => {
          expect(friday).toHaveProperty('departure_times_LOY');
          expect(Array.isArray(friday.departure_times_LOY)).toBe(true);
          expect(friday.departure_times_LOY.length).toBeGreaterThan(0);
        });

        it('should have departure times for SGW', () => {
          expect(friday).toHaveProperty('departure_times_SGW');
          expect(Array.isArray(friday.departure_times_SGW)).toBe(true);
          expect(friday.departure_times_SGW.length).toBeGreaterThan(0);
        });

        it('should have valid time format for LOY times', () => {
          const timeRegex = /^\d{1,2}:\d{2}$/;
          friday.departure_times_LOY.forEach(time => {
            expect(time).toMatch(timeRegex);
          });
        });

        it('should have valid time format for SGW times', () => {
          const timeRegex = /^\d{1,2}:\d{2}$/;
          friday.departure_times_SGW.forEach(time => {
            expect(time).toMatch(timeRegex);
          });
        });

        it('should have fewer departures than weekdays', () => {
          const weekdayDepartures = winterSchedule.Schedule['Monday-Thursday'];
          expect(friday.departure_times_LOY.length).toBeLessThan(
            weekdayDepartures.departure_times_LOY.length
          );
          expect(friday.departure_times_SGW.length).toBeLessThan(
            weekdayDepartures.departure_times_SGW.length
          );
        });
      });
    });

    it('should have object structure maintained', () => {
      // TypeScript ensures immutability at compile time via 'as const'
      expect(typeof SHUTTLE_SCHEDULE).toBe('object');
      expect(SHUTTLE_SCHEDULE.activeSemester).toBeDefined();
    });
  });
});
