import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Card, Tag, Skeleton, Empty, Modal, Button, Form, Input, message } from 'antd';
import { CheckCircleOutlined, CloseOutlined } from '@ant-design/icons';
import logoUrl from '@/assets/logo.png';
import mockupImage from '@/assets/mockup.png';
import waveImage from '@/assets/Wave.png';
import { usePublicSubscriptionPlans } from '@/hooks/useBidanManagement';
import { createSubscriptionApplication } from '@/features/admin/bidanService.api';
import type { SubscriptionPlan } from '@/features/admin/bidan.types';

// Typewriter effect component
function TypewriterText({ text, highlightWord, highlightColor }: { text: string; highlightWord: string; highlightColor: string }) {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        let currentIndex = 0;
        const fullText = text;
        const typingSpeed = 50; // milliseconds per character

        const typeInterval = setInterval(() => {
            if (currentIndex < fullText.length) {
                setDisplayedText(fullText.substring(0, currentIndex + 1));
                currentIndex++;
            } else {
                setIsComplete(true);
                clearInterval(typeInterval);
            }
        }, typingSpeed);

        return () => clearInterval(typeInterval);
    }, [text]);

    // Find the position of the highlight word in the displayed text
    const highlightIndex = displayedText.indexOf(highlightWord);
    const beforeHighlight = highlightIndex >= 0 ? displayedText.substring(0, highlightIndex) : displayedText;
    const highlightText = highlightIndex >= 0 ? highlightWord : '';
    const afterHighlight = highlightIndex >= 0 ? displayedText.substring(highlightIndex + highlightWord.length) : '';

    return (
        <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {beforeHighlight}
            {highlightText && (
                <span style={{ color: highlightColor }}>{highlightText}</span>
            )}
            {afterHighlight}
            {!isComplete && (
                <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block ml-1"
                >
                    |
                </motion.span>
            )}
        </motion.h1>
    );
}

export default function LandingPage() {
    const { data: plansData, isLoading: loadingPlans } = usePublicSubscriptionPlans();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isFormModalVisible, setIsFormModalVisible] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Safely extract plans array
    const plans: SubscriptionPlan[] = Array.isArray(plansData) ? plansData.filter(p => p.is_active) : [];

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleSubscribe = (plan: SubscriptionPlan) => {
        setSelectedPlan(plan);
        setIsModalVisible(false);
        setIsFormModalVisible(true);
        // Set form field value for subscription_plan_id
        form.setFieldValue('subscription_plan_id', plan.subscription_plan_id);
    };

    const handleFormCancel = () => {
        setIsFormModalVisible(false);
        setSelectedPlan(null);
        form.resetFields();
    };

    const handleFormSubmit = async (values: any) => {
        if (!selectedPlan) return;

        setIsSubmitting(true);
        try {
            // Extract subscription_plan_id - handle both object and number cases
            const planId = typeof values.subscription_plan_id === 'object'
                ? values.subscription_plan_id.subscription_plan_id || values.subscription_plan_id.id || selectedPlan.subscription_plan_id
                : values.subscription_plan_id;

            const payload = {
                subscription_plan_id: Number(planId), // Ensure it's a number
                full_name: values.full_name,
                email: values.email,
                phone: values.phone,
                bidan_name: values.bidan_name,
                full_address: values.full_address,
                city: values.city,
                province: values.province,
                str_number: values.str_number,
                sip_number: values.sip_number,
            };

            console.log('Raw form values:', values);
            console.log('Extracted planId:', planId, typeof planId);
            console.log('Submitting payload:', payload);
            console.log('Selected plan:', selectedPlan);

            await createSubscriptionApplication(payload);

            message.success('Pengajuan langganan berhasil dikirim! Kami akan menghubungi Anda segera.');
            handleFormCancel();
        } catch (error: any) {
            console.error('Subscription application error:', error);
            console.error('Error response data:', error.response?.data);
            console.error('Error status:', error.response?.status);

            // If endpoint doesn't exist (404), show WhatsApp alternative
            if (error.response?.status === 404) {
                const whatsappMessage = encodeURIComponent(
                    `Halo, saya ingin mengajukan langganan Prenava:\n\n` +
                    `*Paket:* ${selectedPlan.name}\n` +
                    `*Nama:* ${values.full_name}\n` +
                    `*Email:* ${values.email}\n` +
                    `*No. HP:* ${values.phone}\n` +
                    `*Nama Praktik:* ${values.bidan_name}\n` +
                    `*Alamat:* ${values.full_address}\n\n` +
                    `Mohon info selengkapnya. Terima kasih!`
                );

                Modal.confirm({
                    title: 'Form Pengajuan Belum Tersedia',
                    content: (
                        <div>
                            <p className="mb-4">
                                Maaf, form pengajuan online sedang dalam pengembangan. Silakan kirim data
                                Anda melalui WhatsApp dengan mengklik tombol di bawah ini.
                            </p>
                            <p className="text-sm text-gray-500">
                                Data Anda sudah terisi otomatis. Tinggal kirim saja! 📱
                            </p>
                        </div>
                    ),
                    okText: 'Kirim via WhatsApp',
                    cancelText: 'Tutup',
                    onOk: () => {
                        window.open(`https://wa.me/6281234567890?text=${whatsappMessage}`, '_blank');
                        handleFormCancel();
                    },
                });
            } else if (error.response?.status === 422) {
                // Validation error
                const errors = error.response?.data?.errors || {};
                const errorMessages = Object.values(errors).flat();
                const errorMessage = error.response?.data?.message || 'Validation error';

                console.error('Validation errors:', errors);
                console.error('Error messages:', errorMessages);

                message.error(
                    errorMessages.length > 0
                        ? errorMessages.join(', ')
                        : errorMessage
                );
            } else {
                message.error('Gagal mengirim pengajuan. Silakan hubungi kami via WhatsApp.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="min-h-screen bg-white overflow-hidden relative">
                {/* Wave Background - True background layer */}
                <motion.img
                    src={waveImage}
                    alt="Wave Background"
                    className="absolute bottom-0 right-0 w-full h-auto object-cover z-0"
                    style={{
                        objectPosition: 'bottom right',
                        maxHeight: '100%'
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />

                {/* Content Container - Sits on top of wave */}
                <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left Column - Content */}
                        <div className="order-2 lg:order-1">
                            {/* Logo - Link to /login */}
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity mb-8"
                            >
                                <img src={logoUrl} alt="Prenava Logo" className="w-10 h-10" />
                                <span
                                    className="text-2xl font-semibold"
                                    style={{ color: '#F88A9D' }}
                                >
                                    Prenava
                                </span>
                            </Link>

                            {/* Headline with Typewriter Effect */}
                            <TypewriterText
                                text="Jalani Kehamilan dengan Tenang Bersama Prenava"
                                highlightWord="Prenava"
                                highlightColor="#F88A9D"
                            />

                            {/* Subheadline */}
                            <motion.p
                                className="text-lg md:text-xl mb-8 text-gray-600"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.5, duration: 0.6 }}
                            >
                                Pemantauan dan layanan kesehatan ibu hamil
                            </motion.p>

                            {/* CTA Button */}
                            <motion.button
                                onClick={showModal}
                                className="px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                                style={{ backgroundColor: '#F88A9D', color: '#FFFFFF' }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 2, duration: 0.6 }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f77a8f';
                                    e.currentTarget.style.color = '#FFFFFF';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#F88A9D';
                                    e.currentTarget.style.color = '#FFFFFF';
                                }}
                            >
                                Dapatkan Aplikasi Sekarang
                            </motion.button>
                        </div>

                        {/* Right Column - Phone Mockups */}
                        <div className="order-1 lg:order-2 relative flex items-center justify-center min-h-[500px] lg:min-h-[600px]">
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                            >
                                <img
                                    src={mockupImage}
                                    alt="Prenava App Screens"
                                    className="w-full max-w-3xl lg:max-w-4xl drop-shadow-2xl"
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Subscription Plans Modal */}
            <Modal
                title={<span className="text-2xl font-bold">Paket Langganan Bidan</span>}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={1000}
                closeIcon={<CloseOutlined className="text-gray-500 hover:text-gray-700" />}
                styles={{
                    body: { padding: '24px' }
                }}
            >
                {loadingPlans ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <Card key={`skeleton-${i}`}>
                                <Skeleton active paragraph={{ rows: 6 }} />
                            </Card>
                        ))}
                    </div>
                ) : plans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map((plan, index) => (
                            <motion.div
                                key={plan.subscription_plan_id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <Card
                                    className="h-full hover:shadow-lg transition-shadow duration-300 border-2 hover:border-[#F88A9D]"
                                    styles={{ body: { padding: '24px' } }}
                                >
                                    <div className="flex flex-col h-full">
                                        {/* Plan Header */}
                                        <div className="mb-4">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                {plan.name}
                                            </h3>
                                            <p className="text-gray-600 text-sm">
                                                {plan.description}
                                            </p>
                                        </div>

                                        {/* Price */}
                                        <div className="mb-6">
                                            <span className="text-3xl font-bold" style={{ color: '#F88A9D' }}>
                                                {formatPrice(plan.price)}
                                            </span>
                                            <span className="text-gray-500 text-sm">
                                                / {plan.duration_days} hari
                                            </span>
                                        </div>

                                        {/* Features */}
                                        <div className="flex-grow mb-6">
                                            <ul className="space-y-3">
                                                {plan.features.map((feature, idx) => (
                                                    <li key={`${plan.subscription_plan_id}-feature-${idx}`} className="flex items-start gap-2">
                                                        <CheckCircleOutlined
                                                            className="mt-1 flex-shrink-0"
                                                            style={{ color: '#52c41a' }}
                                                        />
                                                        <span className="text-gray-700 text-sm">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Duration Tag */}
                                        <div className="mt-auto">
                                            <Tag color="pink" className="text-sm">
                                                {plan.duration_days} Hari
                                            </Tag>
                                        </div>

                                        {/* Subscribe Button */}
                                        <div className="mt-4">
                                            <Button
                                                type="primary"
                                                size="large"
                                                block
                                                onClick={() => handleSubscribe(plan)}
                                                style={{
                                                    backgroundColor: '#F88A9D',
                                                    borderColor: '#F88A9D',
                                                    color: '#FFFFFF',
                                                }}
                                            >
                                                Buat Langganan
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <Empty
                        description="Belum ada paket langganan tersedia"
                        className="py-12"
                    />
                )}
            </Modal>

            {/* Subscription Application Form Modal */}
            <Modal
                title={
                    <span className="text-xl font-bold">
                        Form Pengajuan Langganan - {selectedPlan?.name}
                    </span>
                }
                open={isFormModalVisible}
                onCancel={handleFormCancel}
                footer={null}
                width={600}
                closeIcon={<CloseOutlined className="text-gray-500 hover:text-gray-700" />}
            >
                <div className="mb-4 p-4 bg-pink-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                        Anda akan mengajukan langganan <strong>{selectedPlan?.name}</strong>
                        <br />
                        Harga: <strong style={{ color: '#F88A9D' }}>
                            {selectedPlan && formatPrice(selectedPlan.price)}
                        </strong> / {selectedPlan?.duration_days} hari
                    </p>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    requiredMark={false}
                >
                    {/* Hidden field for subscription_plan_id */}
                    <Form.Item
                        name="subscription_plan_id"
                        hidden
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Nama Lengkap"
                        name="full_name"
                        rules={[
                            { required: true, message: 'Nama lengkap wajib diisi' },
                            { min: 3, message: 'Nama minimal 3 karakter' },
                        ]}
                    >
                        <Input placeholder="Masukkan nama lengkap Anda" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Email wajib diisi' },
                            { type: 'email', message: 'Format email tidak valid' },
                        ]}
                    >
                        <Input placeholder="contoh@email.com" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Nomor Telepon (WhatsApp)"
                        name="phone"
                        rules={[
                            { required: true, message: 'Nomor telepon wajib diisi' },
                            { pattern: /^(\+62|62|0)8[1-9][0-9]{6,11}$/, message: 'Format nomor telepon tidak valid' },
                        ]}
                    >
                        <Input placeholder="08xxxxxxxxxx" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Nama Praktik/Klinik Bidan"
                        name="bidan_name"
                        rules={[
                            { required: true, message: 'Nama praktik/klinik wajib diisi' },
                            { min: 3, message: 'Nama praktik minimal 3 karakter' },
                        ]}
                    >
                        <Input placeholder="Contoh: Klinik Bidan Sehat" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Alamat Lengkap"
                        name="full_address"
                        rules={[
                            { required: true, message: 'Alamat lengkap wajib diisi' },
                            { min: 10, message: 'Alamat terlalu singkat' },
                        ]}
                    >
                        <Input.TextArea
                            rows={2}
                            placeholder="Jalan, nomor, kelurahan, kecamatan..."
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Kota/Kabupaten"
                        name="city"
                    >
                        <Input placeholder="Contoh: Bandung" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Provinsi"
                        name="province"
                    >
                        <Input placeholder="Contoh: Jawa Barat" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Nomor STR (Opsional)"
                        name="str_number"
                    >
                        <Input placeholder="Nomor Surat Tanda Registrasi" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Nomor SIP (Opsional)"
                        name="sip_number"
                    >
                        <Input placeholder="Nomor Surat Izin Praktik" size="large" />
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <div className="flex gap-3">
                            <Button onClick={handleFormCancel} size="large" className="flex-1">
                                Batal
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={isSubmitting}
                                size="large"
                                className="flex-1"
                                style={{ backgroundColor: '#F88A9D', borderColor: '#F88A9D' }}
                            >
                                Kirim Pengajuan
                            </Button>
                        </div>
                    </Form.Item>
                </Form>

                <div className="mt-4 text-center text-sm text-gray-500">
                    Atau hubungi kami langsung via{' '}
                    <a
                        href="https://wa.me/6281234567890"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#F88A9D' }}
                    >
                        WhatsApp
                    </a>
                </div>
            </Modal>
        </div>
    );
}
