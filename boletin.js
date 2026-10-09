// --- ESTÁNDAR INSTITUCIONAL: FRAGMENTACIÓN ANTI-CORS COMPLETA ---
const s1 = 'h' + 't' + 't' + 'p' + 's' + ':';
const s2 = '/' + '/w' + 'w' + 'w' + '.' + 'g' + 's' + 't' + 'a' + 't' + 'i' + 'c' + '.' + 'c' + 'o' + 'm';
// CORRECCIÓN: Se añade la letra 'e' omitida en la concatenación institucional
const r1 = '/f' + 'i' + 'r' + 'e' + 'b' + 'a' + 's' + 'e' + 'j' + 's' + '/10.12.0/f' + 'i' + 'r' + 'e' + 'b' + 'a' + 's' + 'e' + '-a' + 'p' + 'p' + '.j' + 's';
const r2 = '/f' + 'i' + 'r' + 'e' + 'b' + 'a' + 's' + 'e' + 'j' + 's' + '/10.12.0/f' + 'i' + 'r' + 'e' + 'b' + 'a' + 's' + 'e' + '-f' + 'i' + 'r' + 'e' + 's' + 't' + 'o' + 'r' + 'e' + '.j' + 's';

// Selectores globales de la interfaz
const contenedorHojas = document. getElementById('contenedorImpresionHojas');
const indicadorCarga = document. getElementById('indicadorCarga');
const btnImprimir = document. getElementById('btnGatillarImpresion');
const btnCerrar = document. getElementById('btnGatillarCierre');
const chkReverso = document. getElementById('chkIncluirReverso');

// Escuchadores fijos de control superior
btnCerrar. addEventListener('click', () => window. close());
btnImprimir. addEventListener('click', () => window. print());

chkReverso. addEventListener('change', function() {
    const hojasReverso = document. querySelectorAll('.boletin-reverso-hoja');
    hojasReverso. forEach( hoja => {
        hoja. style. display = this. checked ? 'block' : 'none';
    });
});

// Orquestador Principal Autónomo de Lectura con Aduana Local Preferente (Colegio HASPEN)
async function inicializarModuloImpresion() {
    try {
        // Importación modular fragmentada segura diferida de librerías base de la CDN
        const { initializeApp } = await import(s1 + s2 + r1);
        const { getFirestore, collection, getDocs, doc, getDoc } = await import(s1 + s2 + r2);

        // CONFIGURACIÓN INSTITUCIONAL EXPLÍCITA SÍNCRONA
        const firebaseConfig = {
            apiKey: "AIzaSyBP3iHdEsCnQSABsxEDDR4RNZ1M06MJyvo",
            authDomain: "://firebaseapp.com",
            projectId: "gestion-alumnos-eeb24",
            storageBucket: "gestion-alumnos-eeb24.firebasestorage.app",
            messagingSenderId: "824391106851",
            appId: "1:824391106851:web:d8fdc7f37351bedc034c96"
        };

        // Inicialización autónoma y segura en el visor hijo
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        const urlParams = new URLSearchParams(window.location.search);
        const paramDni = urlParams.get('dni');
        const paramCursoId = urlParams.get('cursoId');
        const paramCiclo = urlParams.get('ciclo');

        let estudiantesParaImprimir = [];

        // FUNCIÓN AUXILIAR DE DESCIFRADO OFICIAL DE LA PLATAFORMA (PILAR 2)
        function descifrarDatosLocales(stringCifrado) {
            if (!stringCifrado) return null;
            try {
                return JSON.parse(decodeURIComponent(atob(stringCifrado)));
            } catch (e) {
                console.error("Error al descifrar datos de la Aduana Local:", e);
                return null;
            }
        }

        // =========================================================================
        // ESCUDO N° 1: ADUANA LOCAL PREFERENTE SOBRE ALUMNOS (COSTO CERO)
        // =========================================================================
        const claveMaestraCache = `haspen_indice_central_alumnos`;
        const datosLocalesCifrados = localStorage.getItem(claveMaestraCache);
        let baseDeDatosLocal = [];

        if (datosLocalesCifrados) {
            baseDeDatosLocal = descifrarDatosLocales(datosLocalesCifrados) || [];
        }

        if (paramCursoId && paramCiclo) {
            indicadorCarga.textContent = "🔍 Consultando nómina de curso en Aduana Local...";
            // Filtrado nativo directo en memoria RAM local
            estudiantesParaImprimir = baseDeDatosLocal.filter(alu => alu.cursoId === paramCursoId && alu.cicloLectivo === paramCiclo);
            
            // CACHE MISS: Si no hay registros en LocalStorage para ese curso, va a Firebase
            if (estudiantesParaImprimir.length === 0) {
                indicadorCarga.textContent = "🔄 Cache Miss: Sincronizando nómina de curso de Firestore...";
                const snapAlumnos = await getDocs(collection(db, "alumnos"));
                
                // Telemetría oficial
                if (typeof window.actualizarContadoresMonitor === "function" && !snapAlumnos.empty) {
                    window.actualizarContadoresMonitor("firebase_lectura", snapAlumnos.size);
                }

                snapAlumnos.forEach(docSnap => {
                    const alu = docSnap.data();
                    if (alu.cursoId === paramCursoId && alu.cicloLectivo === paramCiclo) {
                        estudiantesParaImprimir.push(alu);
                    }
                    
                    // Actualización silenciosa de la base local
                    const idx = baseDeDatosLocal.findIndex(l => l.dni === alu.dni);
                    if (idx !== -1) baseDeDatosLocal[idx] = alu;
                    else baseDeDatosLocal.push(alu);
                });

                localStorage.setItem(claveMaestraCache, btoa(encodeURIComponent(JSON.stringify(baseDeDatosLocal))));
            }
            estudiantesParaImprimir.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
        } 
        else if (paramDni) {
            indicadorCarga.textContent = "🔍 Recuperando legajo de estudiante de la Aduana Local...";
            const alumnoEncontradoLocal = baseDeDatosLocal.find(alu => alu.dni === paramDni);

            if (alumnoEncontradoLocal) {
                estudiantesParaImprimir.push(alumnoEncontradoLocal);
            } else {
                // CACHE MISS INDIVIDUAL
                indicadorCarga.textContent = "🔄 Cache Miss: Consultando legajo individual en la nube...";
                const snapAlu = await getDoc(doc(db, "alumnos", paramDni));
                
                if (typeof window.actualizarContadoresMonitor === "function") {
                    window.actualizarContadoresMonitor("firebase_lectura", 1);
                }

                if (snapAlu.exists()) {
                    const aluData = snapAlu.data();
                    estudiantesParaImprimir.push(aluData);
                    baseDeDatosLocal.push(aluData);
                    localStorage.setItem(claveMaestraCache, btoa(encodeURIComponent(JSON.stringify(baseDeDatosLocal))));
                }
            }
        }

        if (estudiantesParaImprimir.length === 0) {
            indicadorCarga.textContent = "⚠ No se hallaron matrículas cargadas.";
            contenedorHojas.innerHTML = `<div style="color:white; font-weight:bold; padding:40px; text-align:center;">La consulta no devolvió ningún legajo compatible.</div>`;
            return;
        }

        // Descarga relacional unificada de Cursos para evitar bucles anidados
        const snapCursos = await getDocs(collection(db, "cursos"));
        const listaCursos = [];
        snapCursos.forEach(c => listaCursos.push(c.data()));

        // =========================================================================
        // CORRECCIÓN DEL MOTOR DE CALIFICACIONES: COLECCIÓN REAL "alumnos_calificaciones"
        // =========================================================================
        indicadorCarga.textContent = "🔄 Recuperando matriz de calificaciones oficiales...";
        const snapCalificaciones = await getDocs(collection(db, "alumnos_calificaciones"));
        const listaCalificaciones = [];
        
        if (typeof window.actualizarContadoresMonitor === "function" && !snapCalificaciones.empty) {
            window.actualizarContadoresMonitor("firebase_lectura", snapCalificaciones.size);
        }
        snapCalificaciones.forEach(cal => listaCalificaciones.push(cal.data()));

        let htmlCompiladoMasivo = "";

        for ( const alumno of estudiantesParaImprimir) {
            const cursoRef = listaCursos.find(c => c.id === alumno.cursoId);
            const cursoTexto = cursoRef ? `${cursoRef.ciclo} ° "${cursoRef.division}"` : "Mesa Entrada";
            const turnoTexto = cursoRef ? cursoRef.turno || "S/D" : "S/D";
            const materiasEstructura = cursoRef ? cursoRef.materias || [] : [];

            // Mapeo adaptivo al esquema de datos real del Colegio HASPEN
            const calificacionesEstudiante = {};
            
            listaCalificaciones.forEach(cData => {
                if (String(cData.alumnoDni).trim() === String(alumno.dni).trim()) {
                    const materiaKey = cData.materia ? cData.materia.trim() : "";
                    if (materiaKey) {
                        const n = cData.notes || cData.notas || {};
                        const t1 = n.trim1 || {};
                        const t2 = n.trim2 || {};

                        calificacionesEstudiante[materiaKey] = {
                            c1_nota: cData.notaCuatrimestre1 !== null && cData.notaCuatrimestre1 !== undefined && cData.notaCuatrimestre1 !== "" ? String(cData.notaCuatrimestre1) : "-",
                            c2_nota: cData.notaCuatrimestre2 !== null && cData.notaCuatrimestre2 !== undefined && cData.notaCuatrimestre2 !== "" ? String(cData.notaCuatrimestre2) : "-",
                            nota_final: cData.notaFinal !== null && cData.notaFinal !== undefined && cData.notaFinal !== "" ? String(cData.notaFinal) : "-",
                            diciembre: cData.notaDiciembre !== null && cData.notaDiciembre !== undefined && cData.notaDiciembre !== "" ? String(cData.notaDiciembre) : "-",
                            febrero: cData.notaFebrero !== null && cData.notaFebrero !== undefined && cData.notaFebrero !== "" ? String(cData.notaFebrero) : "-",
                            observaciones: cData.observaciones || ""
                        };
                    }
                }
            });

            htmlCompiladoMasivo += generarHTMLFrenteBoletin(alumno, cursoTexto, turnoTexto, materiasEstructura, calificacionesEstudiante) +
                                   generarHTMLReversoBoletin(alumno, cursoTexto, turnoTexto);
        }

        contenedorHojas.innerHTML = htmlCompiladoMasivo;
        indicadorCarga.textContent = `📋 Boletines listos para impresión: ${estudiantesParaImprimir.length}`;
        btnImprimir.disabled = false;

    } catch (error) {
        console.error("Error en canal de datos Firestore:", error);
        indicadorCarga.textContent = "❌ Error al conectar con la base de datos distribuida.";
    }
}


// --- MICRO-RETRASO DE SEGURIDAD (RESUELVE EL CONGELAMIENTO EN LOCAL) ---
setTimeout( inicializarModuloImpresion, 100);

// --- PLANTILLA: CARILLA FRENTE (NOTAS) ---
// --- PLANTILLA: CARILLA FRENTE (NOTAS Y CALIFICACIONES REALES) ---
function generarHTMLFrenteBoletin( alumno, cursoTexto, turnoTexto, materias, calificaciones) {
    let filasMateriasHTML = "";

    if ( materias. length === 0) {
        filasMateriasHTML = `<tr><td colspan="7" style="padding:10px; text-align:center; color:#666;">Sin espacios curriculares asignados.</td></tr>`;
    } else {
        materias. forEach( materia => {
            // Extraer el objeto mapeado de la materia o inicializarlo vacío
            const c = calificaciones[ materia.trim() ] || {};
            
            // CORRECCIÓN HISTÓRICA: Sincronización absoluta con el motor de base de datos del Paso 1
            const c1  = c. c1_nota     && c. c1_nota     !== "0" ? c. c1_nota     : "-";
            const c2  = c. c2_nota     && c. c2_nota     !== "0" ? c. c2_nota     : "-";
            const fin = c. nota_final  && c. nota_final  !== "0" ? c. nota_final  : "-";
            const dic = c. diciembre   && c. diciembre   !== "0" ? c. diciembre   : "-";
            const feb = c. febrero     && c. febrero     !== "0" ? c. febrero     : "-";
            const obs = c. observaciones || "";

            filasMateriasHTML += `
            <tr class="fila-materia-responsiva" style="border-bottom: 1px solid #000000;">
                <td data-label="Asignatura" style="text-align:left; font-weight:bold; font-size:9px; padding:3px 5px; border:1px solid #000000;">${materia.toUpperCase()}</td>
                <td data-label="1er Cuatrimestre" style="border:1px solid #000000; text-align:center; font-size:10px;">${c1}</td>
                <td data-label="2do Cuatrimestre" style="border:1px solid #000000; text-align:center; font-size:10px;">${c2}</td>
                <td data-label="Final" style="border:1px solid #000000; text-align:center; font-weight:bold; font-size:10px; background:#f1f5f9;">${fin}</td>
                <td data-label="Diciembre" style="border:1px solid #000000; text-align:center; font-size:10px;">${dic}</td>
                <td data-label="Febrero" style="border:1px solid #000000; text-align:center; font-size:10px;">${feb}</td>
                <td data-label="Observaciones" style="border:1px solid #000000; text-align:left; font-size:8px; padding:2px 4px;">${obs}</td>
            </tr>
            `;
        });
    }

    return `
    <div class="contenedor-media-hoja-pdf" id="boletin-frente-${ alumno. dni}">
        <div style="text-align:center; margin-bottom:4px;">
            <h2 style="margin:0; font-size:13px; font-weight:bold; letter-spacing:0.5px;">BOLETÍN DE CALIFICACIONES</h2>
            <h3 style="margin:2px 0 0 0; font-size:10px; font-weight:500;">Colegio Provincial "HASPEN" "Prof. Luis A. Felippa"</h3>
        </div>

        <table style="width:100%; font-size:9px; margin-bottom:6px; border-collapse:collapse; line-height:1.2;">
            <tr>
                <td style="font-weight:bold; width:8%; padding:2px 0;">Alumno:</td>
                <td style="border-bottom:1px solid #000; width:42%; font-weight:bold; text-transform:uppercase;">${ alumno. nombre || ''}</td>
                <td style="font-weight:bold; width:6%; text-align:center;">D.N.I:</td>
                <td style="border-bottom:1px solid #000; width:18%; text-align:center;">${ alumno. dni || ''}</td>
                <td style="font-weight:bold; width:8%; text-align:center;">Curso:</td>
                <td style="border-bottom:1px solid #000; width:18%; font-weight:bold; text-align:center;">${ cursoTexto}</td>
            </tr>
            <tr>
                <td style="font-weight:bold; padding:4px 0 2px 0;">Ciclo Lectivo:</td>
                <td style="border-bottom:1px solid #000; font-weight:bold;">${ alumno. cicloLectivo || '2026'}</td>
                <td style="font-weight:bold; text-align:center;">Turno:</td>
                <td style="border-bottom:1px solid #000; text-align:center;" colspan="3">${ turnoTexto. toUpperCase()}</td>
            </tr>
        </table>

        <table style="width:100%; border-collapse:collapse; margin-top:2px;">
            <thead>
                <tr>
                    <th rowspan="2" style="width:32%; border:1px solid #000000; background:#f1f5f9; font-size:9px; padding:4px; text-align:left;">Asignaturas</th>
                    <th colspan="2" style="border:1px solid #000000; background:#f1f5f9; font-size:9px; padding:2px; text-align:center;">Calificación</th>
                    <th colspan="3" style="border:1px solid #000000; background:#e2e8f0; font-size:9px; padding:2px; text-align:center;">Calificación Definitiva</th>
                    <th rowspan="2" style="width:23%; border:1px solid #000000; background:#f1f5f9; font-size:9px; padding:4px; text-align:center;">Observaciones</th>
                </tr>
                <tr>
                    <th style="width:11%; border:1px solid #000000; font-size:8px; padding:2px; text-align:center;">1er Cuatrimestre</th>
                    <th style="width:11%; border:1px solid #000000; font-size:8px; padding:2px; text-align:center;">2do Cuatrimestre</th>
                    <th style="width:8%; border:1px solid #000000; background:#cbd5e1; font-size:8px; padding:2px; text-align:center;">Final</th>
                    <th style="width:8%; border:1px solid #000000; font-size:8px; padding:2px; text-align:center;">Diciembre</th>
                    <th style="width:8%; border:1px solid #000000; font-size:8px; padding:2px; text-align:center;">Febrero</th>
                </tr>
            </thead>
            <tbody>
                ${ filasMateriasHTML}
            </tbody>
        </table>

        <div style="margin-top:6px; font-size:8px; font-weight:bold; text-transform:uppercase; text-align:left;">
            OBSERVACIONES: Por espacios adeudados comunicarse con Administración
        </div>

        <div style="margin-top:4px; text-align:right; font-size:9px;">
            Río Grande, ______ de _________________ de 20______
        </div>

        <div style="margin-top:12px; display:flex; justify-content:space-between; align-items:center; width:100%;">
            <div style="width:30%; border-top:1px solid #000000; text-align:center; font-size:8px; padding-top:2px;">Firma del/la Estudiante</div>
            <div style="width:30%; border-top:1px solid #000000; text-align:center; font-size:8px; padding-top:2px;">Firma del/la Tutor/a</div>
            <div style="width:30%; border-top:1px solid #000000; text-align:center; font-size:8px; padding-top:2px;">Firma Autoridad Escolar</div>
        </div>
    </div>
    `;
}


// --- PLANTILLA: CARILLA REVERSO (PORTADA) ---
function generarHTMLReversoBoletin( alumno, cursoTexto, turnoTexto) {
    return `
    <div class="contenedor-media-hoja-pdf boletin-reverso-hoja" id="boletin-reverso-${ alumno. dni}" style="margin-top: 15px;">
        <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%; text-align: center;">
            <div style="line-height: 1.4; margin-top: 5px;">
                <h4 style="margin: 0; font-size: 11px; font-weight: bold; text-transform: uppercase;">Provincia de Tierra del Fuego</h4>
                <h5 style="margin: 2px 0; font-size: 10px; font-weight: 500; text-transform: uppercase;">República Argentina</h5>
                <h4 style="margin: 0; font-size: 11px; font-weight: bold; text-transform: uppercase;">Ministerio de Educación</h4>
            </div>

            <div style="margin: 15px 0;">
                <h2 style="margin: 0; font-size: 12px; font-weight: bold; text-transform: uppercase; border-top: 1px solid #000000; border-bottom: 1px solid #000000; padding: 6px 0;">
                    Colegio Provincial HASPEN - "Prof. Luis A. Felippa"
                </h2>
                <h1 style="margin: 14px 0 0 0; font-size: 24px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase; color: #1e293b;">Boletín de</h1>
                <h1 style="margin: 0 0 14px 0; font-size: 24px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase; color: #1e293b;">Calificaciones</h1>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin: 5px 0; font-size: 10px;">
                <thead>
                    <tr style="background: #f1f5f9;">
                        <th style="border: 1px solid #000000; width: 50%; padding: 4px; text-transform: uppercase;">Ciclo</th>
                        <th style="border: 1px solid #000000; width: 50%; padding: 4px; text-transform: uppercase;">Modalidad</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="border: 1px solid #000000; padding: 6px;">Básico</td>
                        <td style="border: 1px solid #000000; padding: 6px;">Enseñanza Secundaria Obligatoria</td>
                    </tr>
                </tbody>
            </table>

            <div class="leyenda-aniversario-resolucion" style="font-size: 13px; font-style: italic; font-weight: 700; padding: 0 15px; margin: 8px 0; line-height: 1.4; color: #000000; text-transform: uppercase;">
                “2026 – 61° Aniversario de la resolución 2065 (xx) de la asamblea general de las Naciones Unidas sobre la cuestión de las Islas Malvinas”
            </div>

            <table style="width: 100%; border-collapse: collapse; margin: 5px 0; font-size: 10px;">
                <thead>
                    <tr style="background: #f1f5f9;">
                        <th style="border: 1px solid #000000; width: 50%; padding: 4px; text-transform: uppercase;">Curso</th>
                        <th style="border: 1px solid #000000; width: 50%; padding: 4px; text-transform: uppercase;">Turno</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="border: 1px solid #000000; padding: 6px; font-weight: bold;">${ cursoTexto}</td>
                        <td style="border: 1px solid #000000; padding: 6px; font-weight: bold; text-transform: uppercase;">${ turnoTexto}</td>
                    </tr>
                </tbody>
            </table>

            <div style="font-size: 10px; font-weight: bold; border-top: 1px dashed #000000; padding-top: 6px; margin-bottom: 4px; text-transform: uppercase;">
                "Las Islas Malvinas, Georgias, Sandwich del Sur, son y serán Argentinas"
            </div>
        </div>
    </div>
    `;
}
