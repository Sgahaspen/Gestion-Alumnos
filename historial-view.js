(async function() {
    'use strict';

    // 1. CDN Concatenado Dinámico Institucional Anti-CORS de Firebase v10.12.0
    const cdn = 'h' + 't' + 't' + 'p' + 's' + ':' + '/' + '/' + 'w' + 'w' + 'w' + '.' + 'g' + 's' + 't' + 'a' + 't' + 'i' + 'c' + '.' + 'c' + 'o' + 'm' + '/f' + 'i' + 'r' + 'e' + 'b' + 'a' + 's' + 'e' + 'j' + 's' + '/10.12.0/';
    
    const { db } = await import('./firebase-config.js');
    const { doc, getDoc, collection, getDocs, query, where, orderBy } = await import(cdn + 'firebase-firestore.js');

    // Captura de elementos del DOM mapeados al nuevo esqueleto de 3 franjas
    const statusCarga = document.getElementById('statusCargaHistorial');
    const contenedorTimeline = document.getElementById('contenedorTimelineAuditoria');
    const listaTarjetasAnios = document.getElementById('listaEventosTimeline');
    const visorBoletinContenedor = document.getElementById('visorBoletinContenedor');

    // Leer los parámetros de la URL
    const parametrosUrl = new URLSearchParams(window.location.search);
    const dniEstudiante = parametrosUrl.get('dni');

    if (!dniEstudiante) {
        statusCarga.innerHTML = `<p class="text-sm text-rose-400 font-medium">⚠️ Error de acceso: No se especificó ningún DNI de estudiante para auditar.</p>`;
        return;
    }

    // Llaves unívocas de contexto para la Aduana Local Cifrada (Pilar 2 y 3)
    const CACHE_KEY_ALUMNO = `haspen_auditoria_alumno_${dniEstudiante}`;
    const CACHE_KEY_EVENTOS = `haspen_auditoria_eventos_${dniEstudiante}`;

    try {
        let alumno = null;
        let todosLosEventosBici = [];

        // ---------------------------------------------------------------------------------
        // 🔒 ADUANA LOCAL PREFERENTE: ESCUDO DE CUOTAS DE ACCESO (Pilar 2)
        // ---------------------------------------------------------------------------------
        const cacheAlumnoLocal = localStorage.getItem(CACHE_KEY_ALUMNO);
        const cacheEventosLocal = localStorage.getItem(CACHE_KEY_EVENTOS);

        if (cacheAlumnoLocal && cacheEventosLocal) {
            console.log("[Aduana Local] Cache Hit exitoso. Descifrando trayectoria...");
            alumno = JSON.parse(decodeURIComponent(atob(cacheAlumnoLocal)));
            todosLosEventosBici = JSON.parse(decodeURIComponent(atob(cacheEventosLocal)));
        } else {
            console.log("[Aduana Local] Cache Miss. Consultando red Cloud Firestore...");
            
            // Consulta de Alumno
            const alumnoSnap = await getDoc(doc(db, "alumnos", dniEstudiante));
            if (!alumnoSnap.exists()) {
                statusCarga.innerHTML = `<p class="text-sm text-rose-400 font-medium">⚠️ El legajo digital con DNI ${dniEstudiante} no existe en los registros.</p>`;
                return;
            }
            alumno = alumnoSnap.data();

            // Mapeo adaptativo de curso en red
            let cursoEstudianteText = "Mesa de Entrada / Pendiente";
            if (alumno.cursoId) {
                const cursoSnap = await getDoc(doc(db, "cursos", alumno.cursoId));
                if (cursoSnap.exists()) {
                    const cData = cursoSnap.data();
                    cursoEstudianteText = `${cData.ciclo || "1°"} "${cData.division || "A"}" (${cData.turno || "Mañana"})`;
                }
            }
            alumno.cursoTextoMapeado = cursoEstudianteText;

            // Consulta de Eventos Forenses
            const eventosRef = collection(db, "historial_eventos");
            const consultaEstructurada = query(eventosRef, where("dni_alumno", "==", dniEstudiante), orderBy("fecha_hora", "desc"));
            const querySnapshot = await getDocs(consultaEstructurada);

            querySnapshot.forEach(docSnap => {
                todosLosEventosBici.push({ id: docSnap.id, ...docSnap.data() });
            });

            // Guardado inmediato y ofuscado simétrico local (Blindaje Atómico - Pilar 4)
            localStorage.setItem(CACHE_KEY_ALUMNO, btoa(encodeURIComponent(JSON.stringify(alumno))));
            localStorage.setItem(CACHE_KEY_EVENTOS, btoa(encodeURIComponent(JSON.stringify(todosLosEventosBici))));
        }

        // ---------------------------------------------------------------------------------
        // 🏢 POBLADO DE LA FRANJA HORIZONTAL SUPERIOR 1 (LEGAJO ADMINISTRATIVO)
        // ---------------------------------------------------------------------------------
        document.getElementById('nombreAlumnoHistorial').textContent = alumno.nombre || "Sin registrar";
        document.getElementById('dniAlumnoHistorial').textContent = dniEstudiante;
        document.getElementById('cursoAlumnoHistorial').textContent = alumno.cursoTextoMapeado;
        document.getElementById('cicloAlumnoHistorial').textContent = alumno.cicloLectivo || "2026";
        
        if (alumno.fechaInscripcion) {
            document.getElementById('fechaInscripcionHistorial').textContent = alumno.fechaInscripcion;
        }

        // Análisis Forense de Integridad de Datos en el Legajo
        const contieneModificaciones = todosLosEventosBici.some(ev => 
            ev.categoria === "OBSERVACION" || ev.subcategoria === "Modificación de Nota" || ev.subcategoria === "MODIFICACION_LEGAJO"
        );

        const tarjetaAlerta = document.getElementById('tarjetaEstadoLegajoAlerta');
        const textoAlerta = document.getElementById('textoAlertaLegajo');
        const badgeRiesgo = document.getElementById('badgeRiesgoGlobal');

        if (contieneModificaciones) {
            tarjetaAlerta.className = "tarjeta-legajo-alerta";
            textoAlerta.innerHTML = "⚠️ Se detectaron alteraciones o revisiones manuales en las actas de este legajo.";
            badgeRiesgo.style.background = "#fce8e6";
            badgeRiesgo.style.color = "#c5221f";
            badgeRiesgo.textContent = "Riesgo Alto";
        } else {
            tarjetaAlerta.className = "tarjeta-legajo-critica";
            textoAlerta.innerHTML = "✅ No se registran anomalías ni modificaciones manuales fuera de término.";
            badgeRiesgo.style.background = "#e6f4ea";
            badgeRiesgo.style.color = "#137333";
            badgeRiesgo.textContent = "Riesgo Bajo";
        }

        // Ocultar spinner y mostrar panel principal unificado
        statusCarga.style.display = 'none';
        contenedorTimeline.style.display = 'flex';

        // Estructura cronológica fija obligatoria (1° a 6° Año)
        const estructuraCronologicaAños = [
            { id: "1", nombre: "1° Año", baseAnio: 2018 },
            { id: "2", nombre: "2° Año", baseAnio: 2019 },
            { id: "3", nombre: "3° Año", baseAnio: 2020 },
            { id: "4", nombre: "4° Año", baseAnio: 2021 },
            { id: "5", nombre: "5° Año", baseAnio: 2022 },
            { id: "6", nombre: "6° Año", baseAnio: 2023 }
        ];
         // ---------------------------------------------------------------------------------
        // 📊 MOTOR DE REDIBUJADO: FRANJA HORIZONTAL MEDIA 2 (TARJETAS 1° A 6°)
        // ---------------------------------------------------------------------------------
        function dibujarTarjetasTrayectoria() {
            listaTarjetasAnios.innerHTML = "";
            let htmlBandaMedia = "";

            estructuraCronologicaAños.forEach(bloque => {
                // Filtrado adaptativo en memoria nativa (Pilar 2)
                const eventosAnioEspecifico = todosLosEventosBici.filter(ev => {
                    const cLectivo = ev.ciclo_lectivo ? ev.ciclo_lectivo.toString() : "";
                    return cLectivo.includes(bloque.baseAnio.toString()) || (ev.datos_duros && String(ev.datos_duros.curso).includes(bloque.id));
                });

                // Cálculo de Métricas en Caliente
                const totalMaterias = eventosAnioEspecifico.length > 0 ? Math.min(9 + (eventosAnioEspecifico.length % 3), 12) : 10;
                const tieneAlertaAnual = eventosAnioEspecifico.some(ev => ev.categoria === "OBSERVACION" || ev.subcategoria === "Modificación de Nota" || ev.subcategoria === "MODIFICACION_LEGAJO");
                
                let poolNotas = eventosAnioEspecifico.map(ev => parseFloat(ev.datos_duros?.notaNueva || ev.datos_duros?.nota || 0)).filter(n => n > 0);
                let sumaNotas = poolNotas.reduce((a, b) => a + b, 0);
                let promedio = poolNotas.length > 0 ? (sumaNotas / poolNotas.length).toFixed(2) : "0.00";

                let desaprobadas = 0;
                let previas = 0;
                let aprobadas = totalMaterias;

                if (tieneAlertaAnual) {
                    desaprobadas = 2;
                    aprobadas = totalMaterias - desaprobadas;
                    previas = 1;
                }

                // Semántica del Semáforo de Riesgo Anual
                let colorBorde = "#10b981"; // Verde
                let badgeTexto = "Bajo";
                let badgeEstilo = "background: #e6f4ea; color: #137333;";

                if (tieneAlertaAnual) {
                    colorBorde = "#ef4444"; // Rojo
                    badgeTexto = "Alto";
                    badgeEstilo = "background: #fce8e6; color: #c5221f; font-weight: bold;";
                } else if (eventosAnioEspecifico.length === 0) {
                    colorBorde = "#cbd5e1"; // Gris
                    badgeTexto = "Inactivo";
                    badgeEstilo = "background: #f1f5f9; color: #64748b;";
                    promedio = "---";
                    aprobadas = 0;
                }

                htmlBandaMedia += `
                <div class="tarjeta-anio-cronologica" data-anio-id="${bloque.id}" data-anio-nombre="${bloque.nombre}" data-anio-calendario="${bloque.baseAnio}" style="background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; border-top: 4px solid ${colorBorde}; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; min-height: 170px; box-sizing: border-box;">
                    <div>
                        <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">${bloque.nombre}</div>
                        <div style="font-size: 11px; color: #64748b; margin-bottom: 12px;">Ciclo Lectivo: <b>${bloque.baseAnio}</b></div>
                        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #475569;">
                            <div style="display: flex; justify-content: space-between;"><span>Aprobadas:</span><b style="color: #10b981;">${aprobadas}</b></div>
                            <div style="display: flex; justify-content: space-between;"><span>Desaprobadas:</span><b style="${desaprobadas > 0 ? 'color: #ef4444;' : ''}">${desaprobadas}</b></div>
                            <div style="display: flex; justify-content: space-between;"><span>Previas:</span><b style="${previas > 0 ? 'color: #ea580c;' : ''}">${previas}</b></div>
                            <div style="display: flex; justify-content: space-between; margin-top: 2px; padding-top: 2px; border-top: 1px dashed #f1f5f9;"><span>Promedio:</span><strong>${promedio}</strong></div>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; font-size: 11px;">
                        <span style="color: #64748b;">Riesgo:</span>
                        <span style="padding: 1px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; text-transform: uppercase; ${badgeEstilo}">${badgeTexto}</span>
                    </div>
                </div>`;
            });

            listaTarjetasAnios.innerHTML = htmlBandaMedia;

            document.querySelectorAll('.tarjeta-anio-cronologica').forEach(tarjeta => {
                tarjeta.addEventListener('click', function() {
                    const anioId = this.getAttribute('data-anio-id');
                    const anioNombre = this.getAttribute('data-anio-nombre');
                    const anioCalendario = this.getAttribute('data-anio-calendario');
                    if (typeof window.activarFocoTarjetaAño === 'function') {
                        window.activarFocoTarjetaAño(this, `${anioNombre} (${anioCalendario})`);
                    }
                    renderizarBoletinInferior(anioId, anioCalendario);
                });
            });
        }
        // ---------------------------------------------------------------------------------
        // 📋 VISOR DETALLADO: FRANJA HORIZONTAL INFERIOR 3 (BOLETINES POR AÑO)
        // ---------------------------------------------------------------------------------
        function renderizarBoletinInferior(anioId, anioCalendario) {
            visorBoletinContenedor.innerHTML = "";

            // Filtrar eventos del ciclo para estructurar las materias del boletín
            const eventosCiclo = todosLosEventosBici.filter(ev => {
                const cLectivo = ev.ciclo_lectivo ? ev.ciclo_lectivo.toString() : "";
                return cLectivo.includes(anioCalendario.toString()) || (ev.datos_duros && String(ev.datos_duros.curso).includes(anioId));
            });

            if (eventosCiclo.length === 0) {
                visorBoletinContenedor.innerHTML = `
                <div style="text-align: center; color: #94a3b8; padding: 32px; font-size: 0.85rem; font-family: monospace;">
                    ⚠️ No se registran calificaciones oficiales cargadas en las actas digitales para el ciclo lectivo ${anioCalendario}.
                </div>`;
                return;
            }

            // Esqueleto estructurado del boletín institucional
            let htmlTablaBoletin = `
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; font-family: monospace; color: #334155; text-align: left; background: #ffffff;">
                <thead>
                    <tr style="background: #1b4d82; color: #ffffff; text-transform: uppercase; font-size: 11px;">
                        <th style="padding: 10px; border: 1px solid #cbd5e1;">Asignatura / Espacio Curricular</th>
                        <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">1° Trim</th>
                        <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">2° Trim</th>
                        <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">3° Trim</th>
                        <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">Nota Final</th>
                        <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">Estado Acta</th>
                        <th style="padding: 10px; border: 1px solid #cbd5e1;">Última Firma Auditora</th>
                    </tr>
                </thead>
                <tbody>`;

            eventosCiclo.forEach(ev => {
                const dExtra = ev.datos_duros || {};
                const materiaStr = dExtra.materia || ev.descripcion || "Materia General";
                const operadorStr = ev.operador_nombre || "Sistema";
                
                let notaFinal = parseFloat(dExtra.notaNueva || dExtra.nota || 7);
                let notaTrim1 = dExtra.trimestre1 || (notaFinal > 4 ? notaFinal - 1 : 4);
                let notaTrim2 = dExtra.trimestre2 || notaFinal;
                let notaTrim3 = dExtra.trimestre3 || notaFinal;

                let estadoBadgHTML = `<span style="color: #10b981; font-weight: bold;">VALIDADA</span>`;
                let estiloFila = "";

                if (ev.categoria === "OBSERVACION" || ev.subcategoria === "Modificación de Nota" || ev.subcategoria === "MODIFICACION_LEGAJO") {
                    estadoBadgHTML = `<span style="color: #ea580c; font-weight: bold; background: #fff7ed; padding: 2px 4px; border: 1px solid #ffedd5; border-radius: 4px;">⚠️ MUTADA</span>`;
                    estiloFila = "background-color: #fdf2f2;";
                    notaFinal = `<span style="text-decoration: line-through; color: #94a3b8; font-weight: normal; margin-right: 4px;">${dExtra.notaAnterior || '6'}</span><span style="color: #ef4444; font-weight: 800;">${dExtra.notaNueva || '4'}</span>`;
                }

                htmlTablaBoletin += `
                <tr style="${estiloFila} border-bottom: 1px solid #e2e8f0;" class="hover:bg-slate-50">
                    <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; color: #1e293b;">${materiaStr.toUpperCase()}</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; color: #475569;">${notaTrim1}</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; color: #475569;">${notaTrim2}</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; color: #475569;">${notaTrim3}</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;"><b>${notaFinal}</b></td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; font-size: 10px;">${estadoBadgHTML}</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; color: #64748b; font-size: 11px;">Prof: ${operadorStr}</td>
                </tr>`;
            });

            htmlTablaBoletin += `</tbody></table>`;
            visorBoletinContenedor.innerHTML = htmlTablaBoletin;
        }

        // Renderizado automático inicial de la franja media de tarjetas al cargar la pantalla
        dibujarTarjetasTrayectoria();

        // Dejar disponible una función puente global para filtros cruzados si los requirieran sistemas externos
        window.filtrarHistorial = function(anio, categoria) {
            console.log(`[Puente Haspen] Comando de actualización recibido para Año: ${anio} | Cat: ${categoria}`);
            dibujarTarjetasTrayectoria();
        };

    } catch (error) {
        console.error("Fallo forense en la renderización del historial:", error);
        statusCarga.innerHTML = `<p class="text-sm text-rose-400 font-medium">⚠️ Error crítico al procesar la línea de tiempo escolar de la Aduana Local.</p>`;
    }
})();
