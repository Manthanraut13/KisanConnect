const StatCard = ({ title, value, icon: Icon, color, change }) => {
  const changePositive = change && change.startsWith('+');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-outline-variant/60 p-5 flex items-center gap-4">
      <div
        className={`h-12 w-12 rounded-full flex items-center justify-center ${color}`}
      >
        <Icon className="h-6 w-6 text-on-surface" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-on-surface-variant truncate">{title}</p>
        <p className="text-2xl font-bold text-on-surface truncate">{value}</p>
        {change && (
          <p
            className={`text-xs font-medium ${
              changePositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {change}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
