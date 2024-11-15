import { DependencyContainer } from "tsyringe";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { IPreSptLoadMod } from "@spt/models/external/IpreSptLoadMod";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { LogTextColor } from "@spt/models/spt/logging/LogTextColor";
import { JsonUtil } from "@spt/utils/JsonUtil";
import { VFS } from "@spt/utils/VFS";
import { ImporterUtil } from "@spt/utils/ImporterUtil";
import path from "path";
import { IDHelper } from "./IDHelper";
import medsConfig from "../config/medsConfig.json";
import recoilConfig from "../config/recoilConfig.json";
import paracetamol from "../db/buffs/paracetamol.json";
import exodrine from "../db/buffs/exodrine.json";

class Mod implements IPostDBLoadMod, IPreSptLoadMod
{
    preSptLoad(container: DependencyContainer): void 
    {
        // get the logger from the server container
        const logger = container.resolve<ILogger>("WinstonLogger");
        logger.logWithColor("[ViniHNS] Not so realistic loading!", LogTextColor.GREEN);
    }

    public postDBLoad(container: DependencyContainer): void 
    {

        const logger2 = container.resolve<ILogger>("WinstonLogger");
        // get database from server
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");

        const idHelper = new IDHelper;

        // Get all the in-memory json found in /assets/database
        const tables = databaseServer.getTables();
        
        // Meds Changes --------------------------------------------------------------------
        function setEffectDamage(item: any, effect: string, configKey: string, config: any): void {
            if (config[configKey]) {
                item._props.effects_damage[effect] = {
                    delay: 0,
                    duration: 0,
                    fadeOut: 0,
                    cost: config[configKey]
                };
            }
        }
    
        function setSurgeryEffect(item: any, configKey: string, config: any): void {
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
    
        function applyChanges(item: any, config: any, prefix: string): void {
            setEffectDamage(item, "Fracture", `${prefix}FractureHealCost`, config);
            setSurgeryEffect(item, `${prefix}SurgeryCost`, config);
            setEffectDamage(item, "HeavyBleeding", `${prefix}HeavyBleedingHealCost`, config);
            setEffectDamage(item, "LightBleeding", `${prefix}LightBleedingHealCost`, config);
        }

        const carKitHP: number = medsConfig.carKitHP;
        const salewaHP: number = medsConfig.salewaHP;
        const ifakHP: number = medsConfig.ifakHP;
        const afakHP: number = medsConfig.afakHP;
        const grizzlyHP: number = medsConfig.grizzlyHP;
        const ai2HP: number = medsConfig.ai2HP;
    
        const calocUsage: number = medsConfig.calocUsage;
        const armyBandageUsage: number = medsConfig.armyBandageUsage;
        const analginPainkillersUsage: number = medsConfig.analginPainkillersUsage;
        const augmentinUsage: number = medsConfig.augmentinUsage;
        const ibuprofenUsage: number = medsConfig.ibuprofenUsage;
        const vaselinUsage: number = medsConfig.vaselinUsage;
        const goldenStarUsage: number = medsConfig.goldenStarUsage;
        const aluminiumSplintUsage: number = medsConfig.aluminiumSplintUsage;
        const cmsUsage: number = medsConfig.cmsUsage;
        const survivalKitUsage: number = medsConfig.survivalKitUsage;


        // Find the meds item by its Id (thanks NoNeedName)
        const carKit = tables.templates.items[idHelper.CAR_FIRST_AID];
        const salewa = tables.templates.items[idHelper.SALEWA];
        const ifak = tables.templates.items[idHelper.IFAK];
        const afak = tables.templates.items[idHelper.AFAK];
        const grizzly = tables.templates.items[idHelper.GRIZZLY];
        const ai2 = tables.templates.items[idHelper.AI2_MEDKIT];
        const calocB = tables.templates.items[idHelper.CALOC_B];
        const armyBandages = tables.templates.items[idHelper.ARMY_BANDAGE];

        const analginPainkillers = tables.templates.items[idHelper.ANALGIN];
        const augmentin = tables.templates.items[idHelper.AUGMENTIN];
        const ibuprofen = tables.templates.items[idHelper.IBUPROFEN];
        const vaselin = tables.templates.items[idHelper.VASELIN];
        const goldenStar = tables.templates.items[idHelper.GOLDEN_STAR];

        const aluminiumSplint = tables.templates.items[idHelper.ALUMINIUM_SPLINT];

        const survivalKit = tables.templates.items[idHelper.SURVIVAL_KIT];
        const cms = tables.templates.items[idHelper.CMS];

        
        // Changes --------------------------------------------------------------------
        
        if (medsConfig.grizzlyChanges) {
            applyChanges(grizzly, medsConfig, "Grizzly");
            grizzly._props.MaxHpResource = grizzlyHP;
            logger2.logWithColor(`[Not So Realistic] Changing Grizzly`, LogTextColor.GREEN);
        } else {
            grizzly._props.effects_damage["LightBleeding"] = {
                delay: 0,
                duration: 0,
                fadeOut: 0,
                cost: 40
            },
            grizzly._props.effects_damage["HeavyBleeding"] = {
                delay: 0,
                duration: 0,
                fadeOut: 0,
                cost: 130
            },
            grizzly._props.effects_damage["Fracture"] = {
                delay: 0,
                duration: 0,
                fadeOut: 0,
                cost: 50
            },
            grizzly._props.effects_damage["Contusion"] = {
                delay: 0,
                duration: 0,
                fadeOut: 0,
                cost: 0
            },
            grizzly._props.effects_damage["RadExposure"] = {
                delay: 0,
                duration: 0,
                fadeOut: 0,
                cost: 0
            }
            grizzly._props.MaxHpResource = 1800;
            logger2.logWithColor(`[Not So Realistic] Grizzly set to default`, LogTextColor.GREEN);
        }
        
        if (medsConfig.ai2Changes) {
            applyChanges(ai2, medsConfig, "ai2");
            ai2._props.MaxHpResource = ai2HP;
            logger2.logWithColor(`[Not So Realistic] Changing AI-2`, LogTextColor.GREEN);
        } else {
            ai2._props.effects_damage["RadExposure"] = {
                delay: 0,
                duration: 0,
                fadeOut: 0,
                cost: 0
            }
            ai2._props.MaxHpResource = 100;
            logger2.logWithColor(`[Not So Realistic] AI-2 set to default`, LogTextColor.GREEN);
        }
        
        if (medsConfig.carKitChanges) {
            applyChanges(carKit, medsConfig, "carKit");
            carKit._props.MaxHpResource = carKitHP;
            logger2.logWithColor(`[Not So Realistic] Changing Car First Aid Kit`, LogTextColor.GREEN);
        } else {
            carKit._props.effects_damage["LightBleeding"] = {
                delay: 0,
                duration: 0,
                fadeOut: 0,
                cost: 50
            }
            carKit._props.MaxHpResource = 220;
            logger2.logWithColor(`[Not So Realistic] Car First Aid Kit set to default`, LogTextColor.GREEN);
        }
        
        if (medsConfig.salewaChanges) {
            applyChanges(salewa, medsConfig, "salewa");
            salewa._props.MaxHpResource = salewaHP;
            logger2.logWithColor(`[Not So Realistic] Changing Salewa`, LogTextColor.GREEN);
        } else {
            salewa._props.effects_damage["LightBleeding"] = {
                delay: 0,
                duration: 0,
                fadeOut: 0,
                cost: 45
            },
            salewa._props.effects_damage["HeavyBleeding"] = {
                delay: 0,
                duration: 0,
                fadeOut: 0,
                cost: 175
            },
            salewa._props.MaxHpResource = 400;
            logger2.logWithColor(`[Not So Realistic] Salewa set to default`, LogTextColor.GREEN);
        }
        
        if (medsConfig.ifakChanges) {
            applyChanges(ifak, medsConfig, "ifak");
            ifak._props.MaxHpResource = ifakHP;
            logger2.logWithColor(`[Not So Realistic] Changing IFAK`, LogTextColor.GREEN);
        } else {
            ifak._props.effects_damage["LightBleeding"] = {
                delay: 0,
                duration: 0,
                fadeOut: 0,
                cost: 30
            },
            ifak._props.effects_damage["HeavyBleeding"] = {
                delay: 0,
                duration: 0,
                fadeOut: 0,
                cost: 210
            },
            ifak._props.effects_damage["RadExposure"] = {
                delay: 0,
                duration: 0,
                fadeOut: 0,
                cost: 0
            }
            ifak._props.MaxHpResource = 300;
            logger2.logWithColor(`[Not So Realistic] IFAK set to default`, LogTextColor.GREEN);
        }
        
        if (medsConfig.afakChanges) {
            applyChanges(afak, medsConfig, "afak");
            afak._props.MaxHpResource = afakHP;
            logger2.logWithColor(`[Not So Realistic] Changing AFAK`, LogTextColor.GREEN);
        } else {
            afak._props.effects_damage["LightBleeding"] = {
                delay: 0,
                duration: 0,
                fadeOut: 0,
                cost: 30
            },
            afak._props.effects_damage["HeavyBleeding"] = {
                delay: 0,
                duration: 0,
                fadeOut: 0,
                cost: 170
            },
            afak._props.effects_damage["RadExposure"] = {
                delay: 0,
                duration: 0,
                fadeOut: 0,
                cost: 0
            }
            afak._props.MaxHpResource = 400;
            logger2.logWithColor(`[Not So Realistic] AFAK set to default`, LogTextColor.GREEN);
        }

        calocB._props.MaxHpResource = calocUsage;
        armyBandages._props.MaxHpResource = armyBandageUsage;
        analginPainkillers._props.MaxHpResource = analginPainkillersUsage;
        augmentin._props.MaxHpResource = augmentinUsage;
        ibuprofen._props.MaxHpResource = ibuprofenUsage;

        vaselin._props.MaxHpResource = vaselinUsage;
        goldenStar._props.MaxHpResource = goldenStarUsage;
        aluminiumSplint._props.MaxHpResource = aluminiumSplintUsage;
        cms._props.MaxHpResource = cmsUsage;
        survivalKit._props.MaxHpResource = survivalKitUsage;

        logger2.logWithColor("[Not So Realistic] All meds changes have been applied successfully!", LogTextColor.GREEN);

        logger2.logWithColor("========================================================================================", LogTextColor.GREEN);
        // -------------------------------------------------------------------------------------

        //Changes in the individual weapon stats ------------------------------------------------
        const kriss_9mm = tables.templates.items[idHelper.kriss_vector_9mm];

        kriss_9mm._props.bFirerate = 1200;

        // Changes in the Recoil of the weapons ------------------------------------------------
        tables.globals.config.Aiming.RecoilCrank = recoilConfig.recoilCrank;
        tables.globals.config.Aiming.RecoilDamping = recoilConfig.recoilDamping;
        tables.globals.config.Aiming.RecoilHandDamping = recoilConfig.recoilHandDamping;
        tables.globals.config.Aiming.RecoilVertBonus = 10;
        tables.globals.config.Aiming.RecoilBackBonus = 10;

        for (const weapons of Object.values(tables.templates.items)) {
            if(weapons._props.hasOwnProperty('weapClass')) {
                const weapClass = weapons._props.weapClass;
                const type = weapons._type;
                if(weapClass == "" || weapClass == null || type == "Node"){
                    continue;
                } else {
                    const recoilConfigMap = {
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

                    if (recoilConfigMap[weapClass]) {
                        const config = recoilConfigMap[weapClass];
                        logger2.logWithColor(`[Not So Realistic] Changing the recoil of ${weapons._name}`, LogTextColor.GREEN);
                        weapons._props.RecoilForceUp *= (1 - config.RecoilUp);
                        weapons._props.RecoilForceBack *= (1 - config.RecoilBack);
                        weapons._props.RecoilReturnSpeedHandRotation *= (1 + config.RecoilConvergence);
                        weapons._props.RecolDispersion *= (1 - config.Dispersion);
                        weapons._props.RecoilDampingHandRotation *= (1 - config.RecoilHandDamping);
                        weapons._props.RecoilCamera *= (1 - config.RecoilCamera);
                        weapons._props.RecoilCategoryMultiplierHandRotation *= (1 - config.RecoilCategoryMultiplierHandRotation);
                        weapons._props.RecoilStableAngleIncreaseStep *= (1 - config.RecoilStableAngleIncreaseStep);
                    } else {
                        logger2.logWithColor(`[Not So Realistic] ${weapons._name} is a ${weapClass}. Ignoring...`, LogTextColor.YELLOW); 
                    }
                }
            }
        }
        logger2.logWithColor("[Not So Realistic] All weapon recoil changes have been applied successfully!", LogTextColor.GREEN);

        logger2.logWithColor("========================================================================================", LogTextColor.GREEN);
        
        // Thanks TRON <3
        const logger = container.resolve<ILogger>("WinstonLogger");
        const db = container.resolve<DatabaseServer>("DatabaseServer").getTables();
        const ImporterUtil = container.resolve<ImporterUtil>("ImporterUtil");
        const JsonUtil = container.resolve<JsonUtil>("JsonUtil");
        const VFS = container.resolve<VFS>("VFS");
        const locales = db.locales.global;
        const items = db.templates.items;
        const handbook = db.templates.handbook.Items;
        const modPath = path.resolve(__dirname.toString()).split(path.sep).join("/")+"/";

        const mydb = ImporterUtil.loadRecursive(`${modPath}../db/`);

        const itemPath = `${modPath}../db/templates/items/`;
        const handbookPath = `${modPath}../db/templates/handbook/`;

        const buffs = db.globals.config.Health.Effects.Stimulator.Buffs

        //ID buff paracetamol -> 67150653e2809bdac7054f97
        //ID buff exodrine    -> 67352799ac0f173f618601ff

        buffs["67150653e2809bdac7054f97"] = paracetamol;
        buffs["67352799ac0f173f618601ff"] = exodrine;


        for(const itemFile in mydb.templates.items) {
            const item = JsonUtil.deserialize(VFS.readFile(`${itemPath}${itemFile}.json`));
            const hb = JsonUtil.deserialize(VFS.readFile(`${handbookPath}${itemFile}.json`));

            const itemId = item._id;
            //logger.info(itemId);

            items[itemId] = item;
            //logger.info(hb.ParentId);
            //logger.info(hb.Price);
            handbook.push({
                "Id": itemId,
                "ParentId": hb.ParentId,
                "Price": hb.Price
            });
        }
        for (const trader in mydb.traders.assort) {
            const traderAssort = db.traders[trader].assort
            
            for (const item of mydb.traders.assort[trader].items) {
                traderAssort.items.push(item);
            }
    
            for (const bc in mydb.traders.assort[trader].barter_scheme) {
                traderAssort.barter_scheme[bc] = mydb.traders.assort[trader].barter_scheme[bc];
            }
    
            for (const level in mydb.traders.assort[trader].loyal_level_items) {
                traderAssort.loyal_level_items[level] = mydb.traders.assort[trader].loyal_level_items[level];
            }
        }
        //logger.info("Test");
        // default localization
        for (const localeID in locales)
        {
            for (const id in mydb.locales.en.templates) {
                const item = mydb.locales.en.templates[id];
                //logger.info(item);
                for(const locale in item) {
                    //logger.info(locale);
                    //logger.info(item[locale]);
                    //logger.info(`${id} ${locale}`);
                    locales[localeID][`${id} ${locale}`] = item[locale];
                }
            }

            for (const id in mydb.locales.en.preset) {
                const item = mydb.locales.en.preset[id];
                for(const locale in item) {
                    //logger.info(`${id} ${locale}`);
                    locales[localeID][`${id}`] = item[locale];
                }
            }
        }

        for (const localeID in mydb.locales)
        {
            for (const id in mydb.locales[localeID].templates) {
                const item = mydb.locales[localeID].templates[id];
                //logger.info(item);
                for(const locale in item) {
                    locales[localeID][`${id}`] = item[locale];
                }
            }

            for (const id in mydb.locales[localeID].preset) {
                const item = mydb.locales[localeID].preset[id];
                for(const locale in item) {
                    //logger.info(`${id} ${locale}`);
                    locales[localeID][`${id} ${locale}`] = item[locale];
                }
                
            }

        }

        

    }
    
}

module.exports = { mod: new Mod() }