import { DependencyContainer } from "tsyringe";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IPreSptLoadMod } from "@spt/models/external/IpreSptLoadMod";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { BaseClasses } from "@spt/models/enums/BaseClasses";
import { ItemHelper } from "@spt/helpers/ItemHelper";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import { JsonUtil } from "@spt/utils/JsonUtil";
import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";
import path from "path";
import fs from "fs";
import { IDHelper } from "./IDHelper";
import medsConfig from "../config/medsConfig.json";
import recoilConfig from "../config/recoilConfig.json";
import qolConfig from "../config/qolConfig.json";
import ammoConfig from "../config/ammoConfig.json";
import miscConfig from "../config/misc.json";
import paracetamol from "../db/buffs/paracetamol.json";
import exodrine from "../db/buffs/exodrine.json";

class Mod implements IPostDBLoadMod, IPreSptLoadMod {
    private readonly MOD_NAME = "[ViniHNS] Not So Realistic";
    private readonly idHelper = new IDHelper();

    // Caliber constants
    private readonly CALIBERS = {
        NATO_762: "Caliber762x51",
        RU_762_54: "Caliber762x54R",
        LAPUA_338: "Caliber86x70",
        RU_12_7: "Caliber127x55",
        RU_762_39: "Caliber762x39"
    };

    // Weapons excluded from recoil changes
    private readonly RECOIL_EXCLUDED_WEAPONS = [
        "6643edda4a05be2737da3134",
        "687e3a7e606386dda2e318f4"
    ];

    // Weapon modifications constants
    private readonly WEAPON_MODS = {
        SCOPES_TO_ADD: [
            "57ac965c24597706be5f975c",
            "57aca93d2459771f2c7e26db",
            "544a3f024bdc2d1d388b4568",
            "544a3a774bdc2d3a388b4567",
            "5d2dc3e548f035404a1a4798",
            "57adff4f24597737f373b6e6",
            "5c0517910db83400232ffee5",
            "591c4efa86f7741030027726",
            "570fd79bd2720bc7458b4583",
            "570fd6c2d2720bc6458b457f",
              "558022b54bdc2dac148b458d",
              "5c07dd120db834001c39092d",
              "5c0a2cec0db834001b7ce47d",
              "58491f3324597764bc48fa02",
              "584924ec24597768f12ae244",
              "5b30b0dc5acfc400153b7124",
              "6165ac8c290d254f5e6b2f6c",
              "60a23797a37c940de7062d02",
              "5d2da1e948f035477b1ce2ba",
              "5c0505e00db834001b735073",
              "609a63b6e2ff132951242d09",
              "584984812459776a704a82a6",
              "59f9d81586f7744c7506ee62",
              "570fd721d2720bc5458b4596",
              "57ae0171245977343c27bfcf",
              "5dfe6104585a0c3e995c7b82",
              "544a3d0a4bdc2d1b388b4567",
              "5d1b5e94d7ad1a2b865a96b0",
              "609bab8b455afd752b2e6138",
              "58d39d3d86f77445bb794ae7",
              "616554fe50224f204c1da2aa",
              "5c7d55f52e221644f31bff6a",
              "616584766ef05c2ce828ef57",
              "5b3b6dc75acfc47a8773fb1e",
              "615d8d878004cc50514c3233",
              "5b2389515acfc4771e1be0c0",
              "577d128124597739d65d0e56",
              "618b9643526131765025ab35",
              "618bab21526131765025ab3f",
              "5c86592b2e2216000e69e77c",
              "5a37ca54c4a282000d72296a",
              "5d0a29fed7ad1a002769ad08",
              "5c064c400db834001d23f468",
              "58d2664f86f7747fec5834f6",
              "57c69dd424597774c03b7bbc",
              "5b3b99265acfc4704b4a1afb",
              "5aa66a9be5b5b0214e506e89",
              "5aa66c72e5b5b00016327c93",
              "5c1cdd302e221602b3137250",
              "61714b2467085e45ef140b2c",
              "6171407e50224f204c1da3c5",
              "61713cc4d8e3106d9806c109",
              "5b31163c5acfc400153b71cb",
              "5a33b652c4a28232996e407c",
              "5a33b2c9c4a282000c5a9511",
              "59db7eed86f77461f8380365",
              "5a1ead28fcdbcb001912fa9f",
              "5dff77c759400025ea5150cf",
              "626bb8532c923541184624b4",
              "62811f461d5df4475f46a332",
              "63fc449f5bd61c6cf3784a88",
              "6477772ea8a38bb2050ed4db",
              "6478641c19d732620e045e17",
              "64785e7c19d732620e045e15",
              "65392f611406374f82152ba5",
              "653931da5db71d30ab1d6296",
              "655f13e0a246670fb0373245",
              "6567e751a715f85433025998" 
        ],
        MUZZLES_TO_ADD: [
            "59d64fc686f774171b243fe2",
            "5a0d716f1526d8000d26b1e2",
            "5f633f68f5750b524b45f112",
            "5c878ebb2e2216001219d48a",
            "59e61eb386f77440d64f5daf",
            "59e8a00d86f7742ad93b569c",
            "5a9ea27ca2750c00137fa672",
            "5cc9ad73d7f00c000e2579d4",
            "5c7951452e221644f31bfd5c",
            "615d8e9867085e45ef1409c6",
            "5a0abb6e1526d8000a025282",
            "59bffc1f86f77435b128b872",
            "593d489686f7745c6255d58a",
            "5a0d63621526d8dba31fe3bf",
            "5a9fbacda2750c00141e080f",
            "64942bfc6ee699f6890dff95"
        ]
    };

    preSptLoad(container: DependencyContainer): void {
        const logger = container.resolve<ILogger>("WinstonLogger");
        logger.logWithColor(`${this.MOD_NAME}: Loading...`, LogTextColor.GREEN);
    }

    public postDBLoad(container: DependencyContainer): void {
        const logger = container.resolve<ILogger>("WinstonLogger");
        
        try {
            const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
            const tables = databaseServer.getTables();
            const itemHelper = container.resolve<ItemHelper>("ItemHelper");

            // Apply all modifications
            this.applyMedsChanges(tables, logger);
            this.applyAmmoChanges(tables, itemHelper, logger);
            this.applyRecoilChanges(tables, logger);
            this.applyWeaponModifications(tables, logger);
            this.loadCustomDatabase(container);

            logger.logWithColor(`${this.MOD_NAME}: Loading complete.`, LogTextColor.GREEN);
        } catch (error) {
            logger.error(`${this.MOD_NAME}: Error during loading: ${error}`);
        }
    }

    private applyMedsChanges(tables: any, logger: ILogger): void {
        if (!medsConfig.enable) {
            this.log("Meds changes disabled!", miscConfig.enableLogs, LogTextColor.YELLOW, logger);
            return;
        }

        const items = tables.templates.items;
        
        // Get med items
        const medItems = {
            carKit: items[this.idHelper.CAR_FIRST_AID],
            salewa: items[this.idHelper.SALEWA],
            ifak: items[this.idHelper.IFAK],
            afak: items[this.idHelper.AFAK],
            grizzly: items[this.idHelper.GRIZZLY],
            ai2: items[this.idHelper.AI2_MEDKIT],
            calocB: items[this.idHelper.CALOC_B],
            armyBandages: items[this.idHelper.ARMY_BANDAGE],
            analginPainkillers: items[this.idHelper.ANALGIN],
            augmentin: items[this.idHelper.AUGMENTIN],
            ibuprofen: items[this.idHelper.IBUPROFEN],
            vaselin: items[this.idHelper.VASELIN],
            goldenStar: items[this.idHelper.GOLDEN_STAR],
            aluminiumSplint: items[this.idHelper.ALUMINIUM_SPLINT],
            survivalKit: items[this.idHelper.SURVIVAL_KIT],
            cms: items[this.idHelper.CMS]
        };

        // Apply med changes
        this.processMedItem(medItems.grizzly, "grizzly", medsConfig.grizzlyHP, medsConfig.grizzlyChanges, logger);
        this.processMedItem(medItems.ai2, "ai2", medsConfig.ai2HP, medsConfig.ai2Changes, logger);
        this.processMedItem(medItems.carKit, "carKit", medsConfig.carKitHP, medsConfig.carKitChanges, logger);
        this.processMedItem(medItems.salewa, "salewa", medsConfig.salewaHP, medsConfig.salewaChanges, logger);
        this.processMedItem(medItems.ifak, "ifak", medsConfig.ifakHP, medsConfig.ifakChanges, logger);
        this.processMedItem(medItems.afak, "afak", medsConfig.afakHP, medsConfig.afakChanges, logger);

        // Apply usage changes to other meds
        this.applyUsageChanges(medItems, logger);

        this.log("Meds changes applied!", miscConfig.enableLogs, LogTextColor.GREEN, logger);
    }

    private processMedItem(item: ITemplateItem, prefix: string, hp: number, enabled: boolean, logger: ILogger): void {
        if (enabled) {
            this.applyMedChanges(item, medsConfig, prefix);
            item._props.MaxHpResource = hp;
            this.log(`Changing ${item._name}`, miscConfig.enableLogs, LogTextColor.GREEN, logger);
        } else {
            this.setDefaultMedValues(item, prefix);
            this.log(`${item._name} set to default`, miscConfig.enableLogs, LogTextColor.GREEN, logger);
        }
    }

    private applyMedChanges(item: any, config: any, prefix: string): void {
        const effects = [
            { effect: "Fracture", canHeal: `${prefix}CanHealFractures`, costKey: `${prefix}FractureHealCost` },
            { effect: "DestroyedPart", canHeal: `${prefix}CanDoSurgery`, costKey: `${prefix}SurgeryCost`, isSurgery: true },
            { effect: "HeavyBleeding", canHeal: `${prefix}CanHealHeavyBleeding`, costKey: `${prefix}HeavyBleedingHealCost` },
            { effect: "LightBleeding", canHeal: `${prefix}CanHealLightBleeding`, costKey: `${prefix}LightBleedingHealCost` },
        ];

        effects.forEach(({ effect, canHeal, costKey, isSurgery }) => {
            if (config[canHeal]) {
                if (isSurgery) {
                    this.setSurgeryEffect(item, costKey, config);
                } else {
                    this.setEffectDamage(item, effect, costKey, config);
                }
            } else {
                this.removeEffect(item, effect);
            }
        });
    }

    private setEffectDamage(item: any, effect: string, configKey: string, config: any): void {
        if (config[configKey]) {
            item._props.effects_damage[effect] = {
                delay: 0,
                duration: 0,
                fadeOut: 0,
                cost: config[configKey]
            };
        }
    }

    private removeEffect(item: any, effect: string): void {
        delete item._props.effects_damage[effect];
    }

    private setSurgeryEffect(item: any, configKey: string, config: any): void {
        if (config[configKey]) {
            item._props.effects_damage["DestroyedPart"] = {
                delay: 0,
                duration: 0,
                fadeOut: 0,
                healthPenaltyMin: 60,
                healthPenaltyMax: 72,
                cost: config[configKey]
            };
        }
    }

    private setDefaultMedValues(item: any, type: string): void {
        // Set default values based on med type
        const defaultValues = {
            grizzly: { hp: 1800, effects: { LightBleeding: 40, HeavyBleeding: 130, Fracture: 50, Contusion: 0, RadExposure: 0 } },
            ai2: { hp: 100, effects: { RadExposure: 0 } },
            carKit: { hp: 220, effects: { LightBleeding: 50 } },
            salewa: { hp: 400, effects: { LightBleeding: 45, HeavyBleeding: 175 } },
            ifak: { hp: 300, effects: { LightBleeding: 30, HeavyBleeding: 210, RadExposure: 0 } },
            afak: { hp: 400, effects: { LightBleeding: 30, HeavyBleeding: 170, RadExposure: 0 } }
        };

        if (defaultValues[type]) {
            item._props.MaxHpResource = defaultValues[type].hp;
            Object.entries(defaultValues[type].effects).forEach(([effect, cost]) => {
                item._props.effects_damage[effect] = {
                    delay: 0,
                    duration: 0,
                    fadeOut: 0,
                    cost: cost
                };
            });
        }
    }

    private applyUsageChanges(medItems: any, logger: ILogger): void {
        medItems.calocB._props.MaxHpResource = medsConfig.calocUsage;
        medItems.armyBandages._props.MaxHpResource = medsConfig.armyBandageUsage;
        medItems.analginPainkillers._props.MaxHpResource = medsConfig.analginPainkillersUsage;
        medItems.augmentin._props.MaxHpResource = medsConfig.augmentinUsage;
        medItems.ibuprofen._props.MaxHpResource = medsConfig.ibuprofenUsage;
        medItems.vaselin._props.MaxHpResource = medsConfig.vaselinUsage;
        medItems.goldenStar._props.MaxHpResource = medsConfig.goldenStarUsage;
        medItems.aluminiumSplint._props.MaxHpResource = medsConfig.aluminiumSplintUsage;
        medItems.cms._props.MaxHpResource = medsConfig.cmsUsage;
        medItems.survivalKit._props.MaxHpResource = medsConfig.survivalKitUsage;
    }

    private applyAmmoChanges(tables: any, itemHelper: ItemHelper, logger: ILogger): void {
        if (!ammoConfig.enable) {
            this.log("Ammo changes disabled!", miscConfig.enableLogs, LogTextColor.YELLOW, logger);
            return;
        }

        const items = Object.values(tables.templates.items);
        const allAmmo = items.filter(x => itemHelper.isOfBaseclass(x._id, BaseClasses.AMMO));
        const allArmor = items.filter(x => itemHelper.isOfBaseclass(x._id, BaseClasses.ARMOR));

        // Apply blunt damage changes to armor
        allArmor.forEach(armor => {
            armor._props.BluntThroughput *= ammoConfig.bluntDamageMultiplier;
        });

        // Apply ammo changes by caliber
        Object.values(this.CALIBERS).forEach(caliber => {
            const ammoOfCaliber = allAmmo.filter(x => x._props.Caliber === caliber);
            this.modifyAmmoStats(ammoOfCaliber, ammoConfig);
        });

        this.log("Ammo changes applied!", miscConfig.enableLogs, LogTextColor.GREEN, logger);
    }

    private modifyAmmoStats(ammoArray: any[], config: any): void {
        ammoArray.forEach(ammo => {
            ammo._props.Damage *= Math.round(config.damageMultiplier);
            ammo._props.PenetrationPower *= Math.round(config.penetrationPowerMultiplier);
            ammo._props.ArmorDamage *= Math.round(config.armorDamageMultiplier);
        });
    }

    private applyRecoilChanges(tables: any, logger: ILogger): void {
        if (!recoilConfig.changes) {
            this.log("All weapon recoil settings remain default. No changes applied.", miscConfig.enableLogs, LogTextColor.YELLOW, logger);
            return;
        }

        // Apply global recoil settings
        this.applyGlobalRecoilSettings(tables);

        // Apply weapon-specific recoil changes
        this.applyWeaponRecoilChanges(tables, logger);

        this.log("Weapon recoil changes applied!", miscConfig.enableLogs, LogTextColor.GREEN, logger);
    }

    private applyGlobalRecoilSettings(tables: any): void {
        const aimingConfig = tables.globals.config.Aiming;
        aimingConfig.RecoilCrank = recoilConfig.recoilCrank;
        aimingConfig.RecoilDamping = recoilConfig.recoilDamping;
        aimingConfig.RecoilHandDamping = recoilConfig.recoilHandDamping;
        aimingConfig.RecoilVertBonus = 10;
        aimingConfig.RecoilBackBonus = 10;
    }

    private applyWeaponRecoilChanges(tables: any, logger: ILogger): void {
        const recoilConfigMap = this.getRecoilConfigMap();

        Object.values(tables.templates.items).forEach((weapon: any) => {
            if (weapon._props?.hasOwnProperty('weapClass')) {
                const weapClass = weapon._props.weapClass;
                
                if (!weapClass || weapClass === "" || weapon._type === "Node") {
                    return;
                }

                // Check if weapon is excluded from recoil changes
                if (this.RECOIL_EXCLUDED_WEAPONS.includes(weapon._id)) {
                    this.log(`${weapon._name} (${weapon._id}) excluded from recoil changes`, miscConfig.enableLogs, LogTextColor.YELLOW, logger);
                    return;
                }

                // Handle double action accuracy penalty
                if (weapon._props.weapFireType?.includes("doubleaction") && qolConfig.enable) {
                    weapon._props.DoubleActionAccuracyPenalty = qolConfig.doubleActionAccuracyPenalty;
                    this.log(`Changing the Double Action Accuracy Penalty from ${weapon._name} to ${qolConfig.doubleActionAccuracyPenalty}`, miscConfig.enableLogs, LogTextColor.GREEN, logger);
                }

                // Apply recoil changes
                if (recoilConfigMap[weapClass]) {
                    this.applyWeaponRecoilConfig(weapon, recoilConfigMap[weapClass], logger);
                } else {
                    this.log(`${weapon._name} is a ${weapClass}. Ignoring...`, miscConfig.enableLogs, LogTextColor.YELLOW, logger);
                }
            }
        });
    }

    private getRecoilConfigMap(): any {
        return {
            smg: {
                RecoilUp: recoilConfig.smgRecoilUp,
                RecoilBack: recoilConfig.smgRecoilBack,
                RecoilConvergence: recoilConfig.smgRecoilConvergence,
                Dispersion: recoilConfig.smgDispersion,
                RecoilHandDamping: recoilConfig.recoilHandDamping,
                RecoilCamera: recoilConfig.smgRecoilCamera,
                RecoilCategoryMultiplierHandRotation: recoilConfig.smgRecoilCategoryMultiplierHandRotation,
                RecoilStableAngleIncreaseStep: recoilConfig.smgRecoilStableAngleIncreaseStep
            },
            assaultRifle: {
                RecoilUp: recoilConfig.assaultRifleRecoilUp,
                RecoilBack: recoilConfig.assaultRifleRecoilBack,
                RecoilConvergence: recoilConfig.assaultRifleRecoilConvergence,
                Dispersion: recoilConfig.assaultRifleDispersion,
                RecoilHandDamping: recoilConfig.recoilHandDamping,
                RecoilCamera: recoilConfig.assaultRifleRecoilCamera,
                RecoilCategoryMultiplierHandRotation: recoilConfig.assaultRifleRecoilCategoryMultiplierHandRotation,
                RecoilStableAngleIncreaseStep: recoilConfig.assaultRifleRecoilStableAngleIncreaseStep
            },
            assaultCarbine: {
                RecoilUp: recoilConfig.assaultCarbineRecoilUp,
                RecoilBack: recoilConfig.assaultCarbineRecoilBack,
                RecoilConvergence: recoilConfig.assaultCarbineRecoilConvergence,
                Dispersion: recoilConfig.assaultCarbineDispersion,
                RecoilHandDamping: recoilConfig.recoilHandDamping,
                RecoilCamera: recoilConfig.assaultCarbineRecoilCamera,
                RecoilCategoryMultiplierHandRotation: recoilConfig.assaultCarbineRecoilCategoryMultiplierHandRotation,
                RecoilStableAngleIncreaseStep: recoilConfig.assaultCarbineRecoilStableAngleIncreaseStep
            },
            sniperRifle: {
                RecoilUp: recoilConfig.sniperRifleRecoilUp,
                RecoilBack: recoilConfig.sniperRifleRecoilBack,
                RecoilConvergence: recoilConfig.sniperRifleRecoilConvergence,
                Dispersion: recoilConfig.sniperRifleDispersion,
                RecoilHandDamping: recoilConfig.recoilHandDamping,
                RecoilCamera: recoilConfig.sniperRifleRecoilCamera,
                RecoilCategoryMultiplierHandRotation: recoilConfig.sniperRifleRecoilCategoryMultiplierHandRotation,
                RecoilStableAngleIncreaseStep: recoilConfig.sniperRifleRecoilStableAngleIncreaseStep
            },
            marksmanRifle: {
                RecoilUp: recoilConfig.marksmanRifleRecoilUp,
                RecoilBack: recoilConfig.marksmanRifleRecoilBack,
                RecoilConvergence: recoilConfig.marksmanRifleRecoilConvergence,
                Dispersion: recoilConfig.marksmanRifleDispersion,
                RecoilHandDamping: recoilConfig.recoilHandDamping,
                RecoilCamera: recoilConfig.marksmanRifleRecoilCamera,
                RecoilCategoryMultiplierHandRotation: recoilConfig.marksmanRifleRecoilCategoryMultiplierHandRotation,
                RecoilStableAngleIncreaseStep: recoilConfig.marksmanRifleRecoilStableAngleIncreaseStep
            },
            pistol: {
                RecoilUp: recoilConfig.pistolRecoilUp,
                RecoilBack: recoilConfig.pistolRecoilBack,
                RecoilConvergence: recoilConfig.pistolRecoilConvergence,
                Dispersion: recoilConfig.pistolDispersion,
                RecoilHandDamping: recoilConfig.recoilHandDamping,
                RecoilCamera: recoilConfig.pistolRecoilCamera,
                RecoilCategoryMultiplierHandRotation: recoilConfig.pistolRecoilCategoryMultiplierHandRotation,
                RecoilStableAngleIncreaseStep: recoilConfig.pistolRecoilStableAngleIncreaseStep
            },
            machinegun: {
                RecoilUp: recoilConfig.machinegunRecoilUp,
                RecoilBack: recoilConfig.machinegunRecoilBack,
                RecoilConvergence: recoilConfig.machinegunRecoilConvergence,
                Dispersion: recoilConfig.machinegunDispersion,
                RecoilHandDamping: recoilConfig.recoilHandDamping,
                RecoilCamera: recoilConfig.machinegunRecoilCamera,
                RecoilCategoryMultiplierHandRotation: recoilConfig.machinegunRecoilCategoryMultiplierHandRotation,
                RecoilStableAngleIncreaseStep: recoilConfig.machinegunRecoilStableAngleIncreaseStep
            },
            shotgun: {
                RecoilUp: recoilConfig.shotgunRecoilUp,
                RecoilBack: recoilConfig.shotgunRecoilBack,
                RecoilConvergence: recoilConfig.shotgunRecoilConvergence,
                Dispersion: recoilConfig.shotgunDispersion,
                RecoilHandDamping: recoilConfig.recoilHandDamping,
                RecoilCamera: recoilConfig.shotgunRecoilCamera,
                RecoilCategoryMultiplierHandRotation: recoilConfig.shotgunRecoilCategoryMultiplierHandRotation,
                RecoilStableAngleIncreaseStep: recoilConfig.shotgunRecoilStableAngleIncreaseStep
            }
        };
    }

    private applyWeaponRecoilConfig(weapon: any, config: any, logger: ILogger): void {
        this.log(`Changing the recoil of ${weapon._name}`, miscConfig.enableLogs, LogTextColor.GREEN, logger);
        
        weapon._props.RecoilForceUp *= (1 - config.RecoilUp);
        weapon._props.RecoilForceBack *= (1 - config.RecoilBack);
        weapon._props.RecoilReturnSpeedHandRotation *= (1 + config.RecoilConvergence);
        weapon._props.RecolDispersion *= (1 - config.Dispersion);
        weapon._props.RecoilDampingHandRotation *= (1 - config.RecoilHandDamping);
        weapon._props.RecoilCamera *= (1 - config.RecoilCamera);
        weapon._props.RecoilCategoryMultiplierHandRotation *= (1 - config.RecoilCategoryMultiplierHandRotation);
        weapon._props.RecoilStableAngleIncreaseStep *= (1 - config.RecoilStableAngleIncreaseStep);
    }

    private applyWeaponModifications(tables: any, logger: ILogger): void {
        const items = tables.templates.items;

        // KRISS Vector 9mm modifications
        const kriss9mm = items[this.idHelper.KRISS_VECTOR_9MM];
        if (kriss9mm) {
            kriss9mm._props.bFirerate = 1100;
        }

        // Alpha Dog Suppressor 9mm modifications
        const alphaDogSuppressor = items[this.idHelper.ALPHA_DOG_ALPHA_SUPRESSOR_9MM];
        if (alphaDogSuppressor) {
            alphaDogSuppressor._props.Slots[0]._props.filters[0].Filter.push(...this.WEAPON_MODS.SCOPES_TO_ADD);
        }

        // RPD modifications
        const rpd520mm = items[this.idHelper.RPD_520mm];
        const rpdSawedOff = items[this.idHelper.RPD_SAWED_OFF_350mm];
        
        if (rpd520mm) {
            rpd520mm._props.Slots[1]._props.filters[0].Filter.push(...this.WEAPON_MODS.MUZZLES_TO_ADD);
        }
        
        if (rpdSawedOff) {
            rpdSawedOff._props.Slots[0]._props.filters[0].Filter.push(...this.WEAPON_MODS.MUZZLES_TO_ADD);
        }

        this.log("Weapon modifications applied!", miscConfig.enableLogs, LogTextColor.GREEN, logger);
    }

    private loadCustomDatabase(container: DependencyContainer): void {
        const logger = container.resolve<ILogger>("WinstonLogger");
        const db = container.resolve<DatabaseServer>("DatabaseServer").getTables();
        const jsonUtil = container.resolve<JsonUtil>("JsonUtil");
        
        const modPath = path.resolve(__dirname, "../");
        const dbPath = path.join(modPath, "db");
        
        if (!fs.existsSync(dbPath)) {
            logger.warning(`${this.MOD_NAME}: Database folder not found at ${dbPath}`);
            return;
        }

        try {
            const customDb = this.loadRecursive(dbPath, jsonUtil, logger);
            this.processCustomBuffs(db);
            this.processCustomItems(customDb, db, jsonUtil);
            this.processTraderAssorts(customDb, db);
            this.processLocalizations(customDb, db);
        } catch (error) {
            logger.error(`${this.MOD_NAME}: Error loading custom database: ${error}`);
        }
    }

    private processCustomBuffs(db: any): void {
        const buffs = db.globals.config.Health.Effects.Stimulator.Buffs;
        
        // Add custom buffs
        buffs["67150653e2809bdac7054f97"] = paracetamol;
        buffs["673780fffa6d1a8ee8c3c405"] = exodrine;
    }

    private loadRecursive(dirPath: string, jsonUtil: JsonUtil, logger: ILogger): any {
        const result: any = {};
        
        const loadDirectory = (currentPath: string, obj: any): void => {
            if (!fs.existsSync(currentPath)) return;
            
            fs.readdirSync(currentPath).forEach(file => {
                const fullPath = path.join(currentPath, file);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    obj[file] = {};
                    loadDirectory(fullPath, obj[file]);
                } else if (file.endsWith('.json')) {
                    const fileName = file.replace('.json', '');
                    try {
                        obj[fileName] = jsonUtil.deserialize(fs.readFileSync(fullPath, 'utf8'));
                    } catch (error) {
                        logger.error(`${this.MOD_NAME}: Error loading ${fullPath}: ${error}`);
                    }
                }
            });
        };
        
        loadDirectory(dirPath, result);
        return result;
    }

    private processCustomItems(customDb: any, db: any, jsonUtil: JsonUtil): void {
        if (!customDb.templates?.items) return;

        Object.keys(customDb.templates.items).forEach(itemFile => {
            const item = customDb.templates.items[itemFile];
            const handbook = customDb.templates.handbook?.[itemFile];
            
            if (item && handbook) {
                db.templates.items[item._id] = item;
                db.templates.handbook.Items.push({
                    Id: item._id,
                    ParentId: handbook.ParentId,
                    Price: handbook.Price
                });
            }
        });
    }

    private processTraderAssorts(customDb: any, db: any): void {
        if (!customDb.traders?.assort) return;

        Object.keys(customDb.traders.assort).forEach(traderId => {
            const traderAssort = db.traders[traderId]?.assort;
            const customAssort = customDb.traders.assort[traderId];
            
            if (traderAssort && customAssort) {
                if (customAssort.items) traderAssort.items.push(...customAssort.items);
                if (customAssort.barter_scheme) Object.assign(traderAssort.barter_scheme, customAssort.barter_scheme);
                if (customAssort.loyal_level_items) Object.assign(traderAssort.loyal_level_items, customAssort.loyal_level_items);
            }
        });
    }

    private processLocalizations(customDb: any, db: any): void {
        if (!customDb.locales) return;

        const locales = db.locales.global;
        
        // Process default English localization
        if (customDb.locales.en) {
            Object.keys(locales).forEach(localeId => {
                this.processLocaleData(customDb.locales.en, locales[localeId]);
            });
        }

        // Process specific localizations
        Object.keys(customDb.locales).forEach(localeKey => {
            if (localeKey !== 'en' && locales[localeKey]) {
                this.processLocaleData(customDb.locales[localeKey], locales[localeKey]);
            }
        });
    }

    private processLocaleData(sourceLocale: any, targetLocale: any): void {
        if (sourceLocale.templates) {
            Object.keys(sourceLocale.templates).forEach(id => {
                const item = sourceLocale.templates[id];
                Object.keys(item).forEach(key => {
                    targetLocale[`${id} ${key}`] = item[key];
                });
            });
        }

        if (sourceLocale.preset) {
            Object.keys(sourceLocale.preset).forEach(id => {
                const item = sourceLocale.preset[id];
                Object.keys(item).forEach(key => {
                    targetLocale[id] = item[key];
                });
            });
        }
    }

    private log(text: string, enable: boolean, color: LogTextColor, logger: ILogger): void {
        if (enable) {
            logger.logWithColor(`${this.MOD_NAME}: ${text}`, color);
        }
    }
}

module.exports = { mod: new Mod() };