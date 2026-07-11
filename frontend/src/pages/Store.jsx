import DashboardLayout from '../components/layout/DashboardLayout';
import { Store as StoreIcon, ShieldCheck, BadgeCheck, Shirt, PenTool, Gift, LayoutTemplate, Palette, Lock } from 'lucide-react';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { walletAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmModal, SuccessModal, InsufficientModal, OwnedModal, VerificationModal, ComingSoonModal } from '../components/store/StoreModals';
import ProfileBadge from '../components/common/ProfileBadge';

const PRODUCTS = [
    {
        id: 'green_tick',
        title: "Green Verification",
        description: "Unlock Green Verification Badge after meeting eligibility requirements.",
        price: 1999,
        status: "Available",
        icon: ShieldCheck,
        gradient: "bg-green-500",
        iconColor: "text-green-500",
        requiresVerification: true
    },
    {
        id: 'blue_tick',
        title: "Blue Verification",
        description: "Premium Developer Verification. Must satisfy eligibility before purchase.",
        price: 2999,
        status: "Available",
        icon: BadgeCheck,
        gradient: "bg-blue-500",
        iconColor: "text-blue-500",
        requiresVerification: true
    },
    {
        id: 'profile_border',
        title: "Premium Profile Border",
        description: "Unlock premium animated profile border.",
        price: 500,
        status: "Available",
        icon: LayoutTemplate,
        gradient: "bg-purple-500",
        iconColor: "text-purple-500"
    },
    {
        id: 'username_color',
        title: "Username Color",
        description: "Choose premium username colors.",
        price: 500,
        status: "Available",
        icon: Palette,
        gradient: "bg-pink-500",
        iconColor: "text-pink-500"
    },
    {
        id: 'tshirt',
        title: "DevFolio Official T-Shirt",
        description: "Premium quality cotton t-shirt with official DevFolio branding.",
        price: 5000,
        status: "Coming Soon",
        icon: Shirt,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600"
    },
    {
        id: 'pen',
        title: "DevFolio Premium Pen",
        description: "A smooth, elegant metal pen for sketching system designs.",
        price: 1500,
        status: "Coming Soon",
        icon: PenTool,
        image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80&w=600"
    },
    {
        id: 'box',
        title: "Exclusive Merchandise Box",
        description: "The ultimate swags box containing stickers, mug, and a hoodie.",
        price: 10000,
        status: "Coming Soon",
        icon: Gift,
        image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=600"
    }
];

const ProductDemo = ({ productId }) => {
    switch (productId) {
        case 'green_tick':
            return (
                <div className="bg-navy-light/40 border border-border/50 rounded-xl p-3 flex items-center justify-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-surface flex shrink-0">
                        <img src="https://ui-avatars.com/api/?name=User&background=2B1D10&color=F8F5EF" alt="Avatar" className="w-full h-full rounded-lg object-cover" />
                    </div>
                    <span className="text-white font-bold text-lg">Alex Doe</span>
                    <ProfileBadge badgeType="green_tick" className="w-5 h-5" />
                </div>
            );
        case 'blue_tick':
            return (
                <div className="bg-navy-light/40 border border-border/50 rounded-xl p-3 flex items-center justify-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-surface flex shrink-0">
                        <img src="https://ui-avatars.com/api/?name=User&background=2B1D10&color=F8F5EF" alt="Avatar" className="w-full h-full rounded-lg object-cover" />
                    </div>
                    <span className="text-white font-bold text-lg">Alex Doe</span>
                    <ProfileBadge badgeType="blue_tick" className="w-5 h-5" />
                </div>
            );
        case 'profile_border':
            return (
                <div className="bg-navy-light/40 border border-border/50 rounded-xl p-3 flex items-center justify-center gap-3 mb-4">
                    <div className="relative w-12 h-12 flex shrink-0">
                        <div className="absolute inset-[-4px] bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-xl animate-pulse" />
                        <img src="https://ui-avatars.com/api/?name=User&background=2B1D10&color=F8F5EF" alt="Avatar" className="w-full h-full rounded-lg object-cover relative z-10" />
                    </div>
                    <span className="text-white font-bold text-lg">Alex Doe</span>
                </div>
            );
        case 'username_color':
            return (
                <div className="bg-navy-light/40 border border-border/50 rounded-xl p-3 flex items-center justify-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-surface flex shrink-0">
                        <img src="https://ui-avatars.com/api/?name=User&background=2B1D10&color=F8F5EF" alt="Avatar" className="w-full h-full rounded-lg object-cover" />
                    </div>
                    <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-xl tracking-tight drop-shadow-sm">Alex Doe</span>
                </div>
            );
        default:
            return null;
    }
};

const StoreItem = ({ product, onInteract }) => {
    const isComingSoon = product.status === 'Coming Soon';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`glass rounded-3xl border border-border hover:border-border/80 relative overflow-hidden flex flex-col h-full transition-all group ${isComingSoon ? 'cursor-not-allowed' : 'cursor-pointer shadow-lg hover:shadow-xl'}`}
            onClick={() => onInteract(product)}
        >
            {/* Image/Gradient Background Layer */}
            {isComingSoon && product.image ? (
                <div className="absolute inset-0 z-0">
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover blur-md scale-110 opacity-40 transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-navy-dark/70" />
                </div>
            ) : (
                <div className={`absolute top-[-20%] right-[-10%] w-48 h-48 blur-[80px] opacity-10 pointer-events-none z-0 ${product.gradient}`} />
            )}
            
            {/* Coming Soon Overlay Content */}
            {isComingSoon && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <div className="bg-surface/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2 shadow-2xl">
                        <Lock className="w-4 h-4 text-white" />
                        <span className="font-bold tracking-widest text-white text-sm">COMING SOON</span>
                    </div>
                </div>
            )}

            {/* Content Container */}
            <div className={`p-6 flex flex-col h-full relative z-20 ${isComingSoon ? 'opacity-40' : ''}`}>
                
                {/* Demo UI if Available */}
                {!isComingSoon && <ProductDemo productId={product.id} />}

                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isComingSoon ? 'bg-surface/50 text-white' : 'bg-surface/80 text-white border border-white/5 shadow-md'}`}>
                        <product.icon className={`w-6 h-6 ${isComingSoon ? '' : product.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-bold text-white leading-tight">{product.title}</h3>
                </div>
                
                <p className="text-ice/70 text-sm mb-6 flex-1 leading-relaxed">{product.description}</p>
                
                <div className="mt-auto">
                    {isComingSoon ? (
                        <button disabled className="w-full py-3 rounded-xl bg-surface/50 text-white font-bold border border-white/10 flex items-center justify-center gap-2 cursor-not-allowed">
                            Coming Soon
                        </button>
                    ) : (
                        <button 
                            className="w-full py-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold border border-primary/30 transition-colors flex items-center justify-between px-5 group-hover:border-primary/50"
                        >
                            <span>Buy with DevCoins</span>
                            <span className="flex items-center gap-1.5">
                                {product.price} <span className="text-yellow-500">🪙</span>
                            </span>
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const Store = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [activeModal, setActiveModal] = useState(null); // 'confirm', 'success', 'insufficient', 'owned', 'requirements', 'comingSoon'
    const [selectedProduct, setSelectedProduct] = useState(null);

    const checkRequirements = () => {
        const metProfile = user.onboardingComplete;
        const metGithub = !!user.githubUsername;
        const metCodeforces = !!user.codeforcesUsername;
        const metSolved = (user.totalSolved || 0) >= 50;
        return metProfile && metGithub && metCodeforces && metSolved;
    };

    const handleInteract = (product) => {
        if (product.status === 'Coming Soon') {
            setSelectedProduct(product);
            setActiveModal('comingSoon');
            return;
        }

        // Available items logic
        setSelectedProduct(product);
        
        // 1. Check if already owned
        if (product.id === 'green_tick' || product.id === 'blue_tick') {
            if (user.profileBadge === product.id || (user.profileBadge === 'blue_tick' && product.id === 'green_tick')) {
                setActiveModal('owned');
                return;
            }
        }
        if (product.id === 'profile_border' && user.profileBorder) {
            setActiveModal('owned');
            return;
        }
        if (product.id === 'username_color' && user.usernameColor) {
            setActiveModal('owned');
            return;
        }

        // 2. Check Verification Requirements for Badges
        if (product.requiresVerification && !checkRequirements()) {
            setActiveModal('requirements');
            return;
        }

        // 3. Check Balance
        if ((user.coins || 0) < product.price) {
            setActiveModal('insufficient');
            return;
        }

        // 4. Show Confirm
        setActiveModal('confirm');
    };

    const confirmPurchase = async () => {
        if (!selectedProduct) return;

        try {
            const res = await walletAPI.redeemBadge(selectedProduct.id);
            if (res.data.success) {
                updateUser({ 
                    coins: res.data.totalCoins, 
                    profileBadge: res.data.profileBadge,
                    profileBorder: res.data.profileBorder,
                    usernameColor: res.data.usernameColor
                });
                setActiveModal('success');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Purchase failed');
            setActiveModal(null);
        }
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-6 sm:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
                        <StoreIcon className="w-6 h-6 sm:w-8 sm:h-8 text-sky flex-shrink-0" /> Reward Store
                    </h2>
                    <p className="text-ice/70 text-sm sm:text-lg">Exchange your hard-earned coins for exclusive perks and swags.</p>
                </div>
                <div className="bg-surface/80 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border border-border shadow-md flex items-center gap-3 sm:gap-4 self-start sm:self-auto">
                    <div className="flex flex-col">
                        <span className="text-ice/50 text-xs uppercase tracking-wider font-bold mb-0.5">Your Balance</span>
                        <span className="text-xl sm:text-2xl font-bold text-white flex items-center gap-1.5 sm:gap-2 leading-none">
                            <span className="text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]">🪙</span> {user?.coins || 0}
                        </span>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                {PRODUCTS.map(product => (
                    <StoreItem 
                        key={product.id}
                        product={product}
                        onInteract={handleInteract}
                    />
                ))}
            </div>

            {/* Modals */}
            <AnimatePresence>
                <ConfirmModal 
                    isOpen={activeModal === 'confirm'} 
                    onClose={() => setActiveModal(null)} 
                    product={selectedProduct} 
                    userCoins={user?.coins || 0} 
                    onConfirm={confirmPurchase} 
                />
                <SuccessModal 
                    isOpen={activeModal === 'success'} 
                    onClose={() => setActiveModal(null)} 
                    product={selectedProduct} 
                    remainingCoins={user?.coins || 0} 
                />
                <InsufficientModal 
                    isOpen={activeModal === 'insufficient'} 
                    onClose={() => setActiveModal(null)} 
                    product={selectedProduct} 
                    userCoins={user?.coins || 0} 
                />
                <OwnedModal 
                    isOpen={activeModal === 'owned'} 
                    onClose={() => setActiveModal(null)} 
                    product={selectedProduct} 
                />
                <VerificationModal 
                    isOpen={activeModal === 'requirements'} 
                    onClose={() => setActiveModal(null)} 
                    user={user} 
                />
                <ComingSoonModal 
                    isOpen={activeModal === 'comingSoon'} 
                    onClose={() => setActiveModal(null)} 
                />
            </AnimatePresence>

        </DashboardLayout>
    );
};

export default Store;
