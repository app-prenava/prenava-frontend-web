import { Select } from 'antd';
import { useDistricts, useProvinces, useRegencies } from '@/services/region.api';

export interface RegionValue {
  province_code?: string;
  regency_code?: string;
  district_code?: string;
}

interface RegionSelectorProps {
  value: RegionValue;
  onChange: (next: RegionValue) => void;
  includeDistrict?: boolean;
  disabled?: boolean;
  layout?: 'grid' | 'stack';
  size?: 'large' | 'middle' | 'small';
}

export default function RegionSelector({
  value,
  onChange,
  includeDistrict = true,
  disabled = false,
  layout = 'grid',
  size = 'large',
}: RegionSelectorProps) {
  const { data: provinces = [], isLoading: loadingProvinces } = useProvinces();
  const { data: regencies = [], isLoading: loadingRegencies } = useRegencies(value.province_code);
  const { data: districts = [], isLoading: loadingDistricts } = useDistricts(
    includeDistrict ? value.regency_code : undefined
  );

  const wrapperClass =
    layout === 'grid'
      ? includeDistrict
        ? 'grid grid-cols-1 md:grid-cols-3 gap-4'
        : 'grid grid-cols-1 md:grid-cols-2 gap-4'
      : 'flex flex-col gap-4';

  return (
    <div className={wrapperClass}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Provinsi <span className="text-red-500">*</span>
        </label>
        <Select
          showSearch
          size={size}
          className="w-full"
          placeholder="Pilih Provinsi"
          loading={loadingProvinces}
          disabled={disabled}
          value={value.province_code || undefined}
          optionFilterProp="label"
          options={provinces.map((p) => ({ value: p.code, label: p.name }))}
          onChange={(province_code) =>
            onChange({
              province_code,
              regency_code: undefined,
              district_code: undefined,
            })
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Kabupaten / Kota <span className="text-red-500">*</span>
        </label>
        <Select
          showSearch
          size={size}
          className="w-full"
          placeholder={value.province_code ? 'Pilih Kabupaten / Kota' : 'Pilih Provinsi dulu'}
          loading={loadingRegencies}
          disabled={disabled || !value.province_code}
          value={value.regency_code || undefined}
          optionFilterProp="label"
          options={regencies.map((r) => ({ value: r.code, label: r.name }))}
          onChange={(regency_code) =>
            onChange({
              ...value,
              regency_code,
              district_code: undefined,
            })
          }
        />
      </div>

      {includeDistrict && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Kecamatan <span className="text-red-500">*</span>
          </label>
          <Select
            showSearch
            size={size}
            className="w-full"
            placeholder={value.regency_code ? 'Pilih Kecamatan' : 'Pilih Kab/Kota dulu'}
            loading={loadingDistricts}
            disabled={disabled || !value.regency_code}
            value={value.district_code || undefined}
            optionFilterProp="label"
            options={districts.map((d) => ({ value: d.code, label: d.name }))}
            onChange={(district_code) =>
              onChange({
                ...value,
                district_code,
              })
            }
          />
        </div>
      )}
    </div>
  );
}

