type RoleToggleProps = {
  role: 'bidan' | 'dinkes';
  onRoleChange: (role: 'bidan' | 'dinkes') => void;
};

export default function RoleToggle({ role, onRoleChange }: RoleToggleProps) {
  const buttonStyle = (isActive: boolean) => ({
    backgroundColor: isActive ? '#FA6978' : 'transparent',
  });

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tipe Akun
      </label>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => onRoleChange('bidan')}
          className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium transition ${
            role === 'bidan'
              ? 'border-[#FA6978] text-white'
              : 'border-gray-200 text-gray-700 hover:border-gray-300'
          }`}
          style={buttonStyle(role === 'bidan')}
        >
          👩‍⚕️ Bidan
        </button>
        <button
          type="button"
          onClick={() => onRoleChange('dinkes')}
          className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium transition ${
            role === 'dinkes'
              ? 'border-[#FA6978] text-white'
              : 'border-gray-200 text-gray-700 hover:border-gray-300'
          }`}
          style={buttonStyle(role === 'dinkes')}
        >
          🏥 Dinkes
        </button>
      </div>
    </div>
  );
}
