const formatHackathonsCount = (count: number): string => {
    return count === 6 ? "6+" : count.toString();
};

export default formatHackathonsCount;